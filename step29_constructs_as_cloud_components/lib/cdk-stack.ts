import * as cdk from "@aws-cdk/core";
import * as sqs from "@aws-cdk/aws-sqs";
import * as sns_sub from "@aws-cdk/aws-sns-subscriptions";

// Importing our custom construct
import { NotifyingBucket } from "../constructs/notifyBucket";

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Here we use our custom created construct to send a notification to SQS
    // whenever we upload a file to the folder test in our s3 bucket
    const testBucket = new NotifyingBucket(this, "notifyingTestBucket", {
      prefix: "test/",
    });

    // A simple que to send our sns notifications to.
    const queue = new sqs.Queue(this, "NewTestQueue");

    testBucket.topic.addSubscription(new sns_sub.SqsSubscription(queue));
  }
}
