import * as cdk from "@aws-cdk/core";
import * as events from "@aws-cdk/aws-events";
import * as appsync from "@aws-cdk/aws-appsync";
import * as targets from "@aws-cdk/aws-events-targets";
import * as subscriptions from "@aws-cdk/aws-sns-subscriptions";
import * as sns from "@aws-cdk/aws-sns";
import * as sqs from "@aws-cdk/aws-sqs";

export class Step05PublishUsingEventStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // API
    const api = new appsync.GraphqlApi(this, "Api", {
      name: "appsyncEventbridgeAPI",
      schema: appsync.Schema.fromAsset("schema/schema.graphql"),
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

    // HTTP DATASOURCE
    const httpDs = api.addHttpDataSource(
      "ds",
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
    events.EventBus.grantPutEvents(httpDs);

    // RESOLVER
    const putEventResolver = httpDs.createResolver({
      typeName: "Mutation",
      fieldName: "createEvent",
      requestMappingTemplate: appsync.MappingTemplate.fromFile("request.vtl"),
      responseMappingTemplate: appsync.MappingTemplate.fromFile("response.vtl"),
    });

    // create an SNS topic
    const myTopic = new sns.Topic(this, "MyTopic");

    // create a dead letter queue
    const dlQueue = new sqs.Queue(this, "DeadLetterQueue", {
      queueName: "MySubscription_DLQ",
      retentionPeriod: cdk.Duration.days(14),
    });

    // subscribe email to the topic
    myTopic.addSubscription(
      new subscriptions.EmailSubscription("ADD YOUR EMAIL HERE", {
        json: false,
        deadLetterQueue: dlQueue,
      })
    );

    // create a rule to publish events on SNS topic
    const rule = new events.Rule(this, "AppSyncEventBridgeRule", {
      eventPattern: {
        source: ["eru-appsync-events"], // every event that has source = "eru-appsync-events" will be sent to SNS topic
      },
    });

    // add the topic as a target to the rule created above
    rule.addTarget(new targets.SnsTopic(myTopic));
  }
}
