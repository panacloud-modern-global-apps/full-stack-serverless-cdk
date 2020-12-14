import * as cdk from "@aws-cdk/core";
import * as subscriptions from "@aws-cdk/aws-sns-subscriptions";
import * as sns from "@aws-cdk/aws-sns";
import * as sqs from "@aws-cdk/aws-sqs";

export class Step04SmsSubscriptionStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create an SNS topic
    const myTopic = new sns.Topic(this, "MyTopic");

    // create a dead letter queue
    const dlQueue = new sqs.Queue(this, "DeadLetterQueue", {
      queueName: "MySubscription_DLQ",
      retentionPeriod: cdk.Duration.days(14),
    });

    // subscribe SMS number to the topic
    myTopic.addSubscription(
      new subscriptions.SmsSubscription("+92XXXXXXXXXX", {
        deadLetterQueue: dlQueue,
        filterPolicy: {
          test: sns.SubscriptionFilter.numericFilter({
            greaterThan: 100
          }),
        },
      })
    );
  }
}
