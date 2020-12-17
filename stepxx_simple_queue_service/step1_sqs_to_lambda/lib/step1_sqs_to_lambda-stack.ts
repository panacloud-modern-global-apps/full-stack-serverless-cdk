import * as cdk from "@aws-cdk/core";
import * as sqs from "@aws-cdk/aws-sqs";
import * as lambda from "@aws-cdk/aws-lambda";
import * as lambdaEvents from "@aws-cdk/aws-lambda-event-sources";

import * as path from "path";

export class Step1SqsToLambdaStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sqsLambda = new lambda.Function(this, "sqsLambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "/../", "lambda")),
      handler: "index.handler",
      reservedConcurrentExecutions: 1, // only have 1 invocation at a time.
    });

    const queue = new sqs.Queue(this, "testQueue", {
      queueName: "testQueue",
      encryption: sqs.QueueEncryption.UNENCRYPTED,
      retentionPeriod: cdk.Duration.days(4),
      visibilityTimeout: cdk.Duration.seconds(30), // default,
      receiveMessageWaitTime: cdk.Duration.seconds(20), // default
    });

    sqsLambda.addEventSource(
      new lambdaEvents.SqsEventSource(queue, {
        batchSize: 10, // default
      })
    );
  }
}
