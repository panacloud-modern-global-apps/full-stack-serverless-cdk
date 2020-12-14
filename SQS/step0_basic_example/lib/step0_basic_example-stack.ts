import * as cdk from "@aws-cdk/core";
import * as sqs from "@aws-cdk/aws-sqs";

export class Step0BasicExampleStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // This is how we define a basic SQS queue.
    const basicDefaultQueue = new sqs.Queue(this, "basicSqs", {
      queueName: "simpleSQS", // The name of the queue.
      encryption: sqs.QueueEncryption.UNENCRYPTED, // whether to encrypt messages or not, Default is unencrypted
      retentionPeriod: cdk.Duration.days(4), // This is the duration for which sqs will store messages, 4 days is the default
      
    });
  }
}
