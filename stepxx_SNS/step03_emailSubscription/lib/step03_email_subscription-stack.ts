import * as cdk from "@aws-cdk/core";
import * as subscriptions from "@aws-cdk/aws-sns-subscriptions";
import * as sns from "@aws-cdk/aws-sns";
import * as sqs from "@aws-cdk/aws-sqs";

export class Step03EmailSubscriptionStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
  }
}
