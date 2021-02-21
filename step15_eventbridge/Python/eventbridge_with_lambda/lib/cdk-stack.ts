import * as cdk from "@aws-cdk/core";
import * as events from "@aws-cdk/aws-events";
import * as targets from "@aws-cdk/aws-events-targets";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as path from "path";

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // lambda that will produce our custom event.
    const producerFn = new lambda.Function(this, "producerLambda", {
      code: lambda.Code.fromAsset("lambda"),
      handler: "producer.handler",
      runtime: lambda.Runtime.PYTHON_3_7,
    });

    // Grant the lambda permission to put custom events on eventbridge
    events.EventBus.grantPutEvents(producerFn);

    // Api gateway to be able to send custom events from frontend
    const api = new apigateway.LambdaRestApi(this, "testApi", {
      handler: producerFn,
    });

    // The lambda function which our eventbridge rule will trigger when it matches the country as PK
    const consumerFn = new lambda.Function(this, "consumerLambda", {
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.fromAsset("lambda"),
      handler: "consumer.handler",
    });

    // The rule that filters events to match country == "PK" and sends them to the consumer Lambda.
    const PKrule = new events.Rule(this, "orderPKLambda", {
      targets: [new targets.LambdaFunction(consumerFn)],
      description:
        "Filter events that come from country PK and invoke lambda with it.",
      eventPattern: {
      source: ["custom.api"]
      },
    });
  }
}
