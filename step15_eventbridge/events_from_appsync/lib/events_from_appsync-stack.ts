import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as events from "@aws-cdk/aws-events";
import * as appsync from "@aws-cdk/aws-appsync";
import * as targets from "@aws-cdk/aws-events-targets";

export class EventsFromAppsyncStack extends cdk.Stack {
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

    // TESTING ECHO LAMBDA
    const echoLambda = new lambda.Function(this, "echoFunction", {
      code: lambda.Code.fromInline(
        "exports.handler = (event, context) => { console.log(event); context.succeed(event); }"
      ),
      handler: "index.handler",
      runtime: lambda.Runtime.NODEJS_10_X,
    });

    // RULE ON DEFAULT EVENT BUS TO TARGET ECHO LAMBDA
    const rule = new events.Rule(this, "AppSyncEventBridgeRule", {
      eventPattern: {
        source: ["eru-appsync-events"], // every event that has source = "eru-appsync-events" will be sent to our echo lambda
      },
    });
    rule.addTarget(new targets.LambdaFunction(echoLambda));
  }
}
