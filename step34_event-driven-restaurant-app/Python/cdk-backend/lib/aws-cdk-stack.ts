import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as events from '@aws-cdk/aws-events';
import * as eventsTargets from '@aws-cdk/aws-events-targets';
import * as lambda from '@aws-cdk/aws-lambda';
import * as sns from '@aws-cdk/aws-sns';
import * as iam from '@aws-cdk/aws-iam';
import * as snsSubscriptions from '@aws-cdk/aws-sns-subscriptions';
import * as stepFunctions from '@aws-cdk/aws-stepfunctions';
import * as stepFunctionsTasks from '@aws-cdk/aws-stepfunctions-tasks';
import * as cognito from "@aws-cdk/aws-cognito"
import { requestTemplate, responseTemplate, EVENT_SOURCE } from '../utils/appsync-request-response';


export class AwsCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    ////////////////////// creating User Pool /////////////////////////////////
    const userPool = new cognito.UserPool(this, "userPool-Amplify", {
      selfSignUpEnabled: true,
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      userVerification: {
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      autoVerify: { email: true, },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        phoneNumber: {
          required: true,
          mutable: true
        }
      },
    })
    const userPoolClient = new cognito.UserPoolClient(this, "userPoolClient-Amplify", {
      userPool,
    })

    new cognito.CfnUserPoolGroup(this, "AdminsGroup", {
      groupName: 'admins',
      userPoolId: userPool.userPoolId,
    });
    new cognito.CfnUserPoolGroup(userPool, "AdminsGroup",{
      groupName: 'admins',
      userPoolId: userPool.userPoolId,
    })

    // Appsync API
    const api = new appsync.GraphqlApi(this, "Api", {
      name: "appsyncEventbridgeAPI",
      schema: appsync.Schema.fromAsset("utils/schema.gql"),
      // authorizationConfig: {
      //   defaultAuthorization: {
      //     userPoolConfig: { userPool },
      //     authorizationType: appsync.AuthorizationType.USER_POOL,
      //   },
      // },
      logConfig: { fieldLogLevel: appsync.FieldLogLevel.ALL },
      xrayEnabled: true,
    });

    // Create new DynamoDB Table for Todos
    const RestaurantAppTable = new dynamodb.Table(this, 'RestaurantAppTable', {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
    });


    /////////////////  APPSYNC data source /////////////////////////////

    // DynamoDB as a Datasource for the Graphql API.
    const restaurantTimeSlotsDS = api.addDynamoDbDataSource('RestaurantTimeSlots', RestaurantAppTable);

    // No Datasource for the Graphql API
    const appsyncNoDS = api.addNoneDataSource("noDataSource", {
      name: "noDataSource",
      description: "Does not save incoming data anywhere",
    });

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
    const mutations = ["addTimeSlot", "deleteTimeSlot", "bookTimeSlot", "addBookingRequest", "deleteBookingRequest", "cancelBooking", "resetAllBookings"]

    mutations.forEach((mut) => {
      let details = `\\\"id\\\": \\\"$ctx.args.id\\\"`;

      if (mut === 'addTimeSlot') {
        details = `\\\"from\\\":\\\"$ctx.args.timeSlot.from\\\", \\\"to\\\":\\\"$ctx.args.timeSlot.to\\\"`
      } else if (mut === "addBookingRequest") {
        details = `\\\"id\\\":\\\"$ctx.args.id\\\", \\\"userName\\\":\\\"$ctx.args.userName\\\"`
      }

      httpEventTriggerDS.createResolver({
        typeName: "Mutation",
        fieldName: mut,
        requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
        responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
      });
    });
    /* Mutation also for Subscription */
    appsyncNoDS.createResolver({
      typeName: "Mutation",
      fieldName: "generateAction",
      requestMappingTemplate: appsync.MappingTemplate.fromString(`{
        "version" : "2017-02-28",
        "payload": $util.toJson($context.arguments)
        }`),
      responseMappingTemplate: appsync.MappingTemplate.fromString(
        "$util.toJson($context.result)"
      ),
    });

    //////////////////////// creating SNS topic /////////////////////////////////
    const snsTopic = new sns.Topic(this, "BookingRequest");
    // Adding SNS subscribers
    /* subscriber 1 */
    // ref https://docs.aws.amazon.com/cdk/latest/guide/parameters.html
    // const email = new cdk.CfnParameter(this, 'emailParam', { type: 'String' }) // taking input
    snsTopic.addSubscription(
      new snsSubscriptions.EmailSubscription("hhzule@gmail.com")
    );
    /* subscriber 2 */
    // const phoneNoParam = new cdk.CfnParameter(this, 'phoneNoParam', { type: 'String' }) // taking input
    snsTopic.addSubscription(
      new snsSubscriptions.SmsSubscription("+92xxxxxxx")
    );

    ////////////////////////////// Creating Lambda handler ////////////////////////
    /* lambda 1 */
    const dynamoHandlerLambda = new lambda.Function(this, 'Dynamo_Handler', {
      code: lambda.Code.fromAsset('lambda-fns'),
      runtime: lambda.Runtime.PYTHON_3_7,
      handler: 'dynamoHandler.handler',
      environment: {
        DYNAMO_TABLE_NAME: RestaurantAppTable.tableName,
      },
      // timeout: cdk.Duration.seconds(10)
    });
    // Giving Table access to dynamoHandlerLambda
    RestaurantAppTable.grantReadWriteData(dynamoHandlerLambda);

    /* lambda 2 */
    // creating role for giving sns:publish access to lambda
    const role = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });
    const policy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["SNS:Publish", "logs:*"],
      resources: ['*']
    });
    role.addToPolicy(policy);

    // creating lambda
    const snsHanlderLambda = new lambda.Function(this, 'SNS_Hanlder', {
      code: lambda.Code.fromAsset('lambda-fns'),
      runtime: lambda.Runtime.PYTHON_3_7,
      handler: 'snsHandler.handler',
      environment: {
        SNS_TOPIC_ARN: snsTopic.topicArn,
        PHONE_NUMBER: "+92xxxxxxxx"
      },
      // timeout: cdk.Duration.seconds(10),
      role: role,
    });

    //////////////// Creating Steps of StepFunctions //////////////////////////
    /* Step 1 */
    const firstStep = new stepFunctionsTasks.LambdaInvoke(this, "Dynamo_Handler_Lambda",
      { lambdaFunction: dynamoHandlerLambda, }
    );
    /* Step 2 */
    const secondStep = new stepFunctionsTasks.LambdaInvoke(this, "SNS_Hanlder_Lambda", {
      lambdaFunction: snsHanlderLambda,
      inputPath: "$.Payload"
    });

    // creating chain to define the sequence of execution
    const stf_chain = stepFunctions.Chain
      .start(firstStep)
      .next(secondStep);

    // create a state machine
    const stateMachine = new stepFunctions.StateMachine(this, 'StateMachine',
      {
        definition: stf_chain
      })


    ////////// Creating rule to invoke step function on event ///////////////////////
    new events.Rule(this, "eventConsumerRule", {
      eventPattern: {
        source: [EVENT_SOURCE],
        detailType: [...mutations,],
      },
      targets: [new eventsTargets.SfnStateMachine(stateMachine)]
    });


    // Log GraphQL API Endpoint
    new cdk.CfnOutput(this, 'Graphql_Endpoint', {
      value: api.graphqlUrl
    });

    // new cdk.CfnOutput(this, "UserPoolId", {
    //   value: userPool.userPoolId,
    // })

    // new cdk.CfnOutput(this, "UserPoolClientId", {
    //   value: userPoolClient.userPoolClientId,
    // })

  }
}
