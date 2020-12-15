import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as events from '@aws-cdk/aws-events';
import * as eventsTargets from '@aws-cdk/aws-events-targets';
import * as lambda from '@aws-cdk/aws-lambda';
import * as sns from '@aws-cdk/aws-sns';
import * as snsSubscriptions from '@aws-cdk/aws-sns-subscriptions';
import * as stepfunctions from '@aws-cdk/aws-stepfunctions';
import * as stepfunctionsTasks from '@aws-cdk/aws-stepfunctions-tasks';
import { requestTemplate, responseTemplate, EVENT_SOURCE } from '../utils/appsync-request-response';

export class AwsCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // Appsync API
    const api = new appsync.GraphqlApi(this, "Api", {
      name: "appsyncEventbridgeAPI",
      schema: appsync.Schema.fromAsset("utils/schema.gql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
      },
      logConfig: { fieldLogLevel: appsync.FieldLogLevel.ALL },
      xrayEnabled: true,
    });

    // Create new DynamoDB Table for Todos
    const RestaurantAppTable = new dynamodb.Table(this, 'RestaurantAppTable', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
    });


    /////////////////  APPSYNC data source /////////////////////////////

    // DynamoDB as a Datasource for the Graphql API.
    const restaurantTimeSlotsDS = api.addDynamoDbDataSource('RestaurantTimeSlots', RestaurantAppTable);

    // HTTP as Datasource for the Graphql API
    const httpEventTriggerDS = api.addHttpDataSource(
      "eventTriggerDS",
      "https://events." + this.region + ".amazonaws.com/", // This is the ENDPOINT for eventbridge.
      {
        name: "httpDsWithEventBridge",
        description: "From Appsync to Eventbridge",
        authorizationConfig: {
          signingRegion: this.region,
          signingServiceName: "events",
        },
      }
    );
    events.EventBus.grantPutEvents(httpEventTriggerDS);


    ///////////////  APPSYNC  Resolvers   ///////////////
    /* Query */
    restaurantTimeSlotsDS.createResolver({
      typeName: "Query",
      fieldName: "getTimeSlots",
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });
    /* Mutation */
    const mutations = ["addTimeSlot", "deleteTimeSlot", "bookTimeSlot", "cancelBooking", "cancelAllBooking"]
    mutations.forEach((mut) => {
      let details = `\\\"id\\\": \\\"$ctx.args.id\\\"`;
      if (mut === 'addTimeSlot') {
        details = `\\\"to\\\":\\\"$ctx.args.timeSlot.to\\\", \\\"from\\\":\\\"$ctx.args.timeSlot.from\\\", \\\"isBooked\\\":$ctx.args.timeSlot.isBooked`
      }

      httpEventTriggerDS.createResolver({
        typeName: "Mutation",
        fieldName: mut,
        requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
        responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
      });
    });


    ////////// Creating Event Consumer handler and defining rules
    const eventConsumerLambda = new lambda.Function(this, 'EventConsumer', {
      code: lambda.Code.fromAsset('lambda-fns'),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'eventConsumer.handler',
      environment: {
        DYNAMO_TABLE_NAME: RestaurantAppTable.tableName,
      },
      timeout: cdk.Duration.seconds(10)
    });
    const eventConsumerRules = new events.Rule(this, "eventConsumerLambdaRule", {
      eventPattern: {
        source: [EVENT_SOURCE],
        detailType: [...mutations,],
      },
    });
    eventConsumerRules.addTarget(new eventsTargets.LambdaFunction(eventConsumerLambda));
    
    // Giving Table access to event consumer lambda
    RestaurantAppTable.grantReadWriteData(eventConsumerLambda);


    // Log GraphQL API Endpoint
    new cdk.CfnOutput(this, 'Graphql_Endpoint', {
      value: api.graphqlUrl
    });

    // Log API Key
    new cdk.CfnOutput(this, 'Graphql_API_Key', {
      value: api.apiKey || "api key not found"
    });

  }
}
