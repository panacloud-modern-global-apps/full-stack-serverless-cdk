import * as cdk from "@aws-cdk/core";
import * as sns from "@aws-cdk/aws-sns";
import * as subscriptions from "@aws-cdk/aws-sns-subscriptions";
import * as sqs from "@aws-cdk/aws-sqs";

export class Step02SqsSubscriptionStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create an SNS topic
    const myTopic = new sns.Topic(this, "MyTopic");

    // create a queue for subscription

    const myQueue = new sqs.Queue(this, "MyQueue");

    // create a dead letter queue

    const dlQueue = new sqs.Queue(this, "DeadLetterQueue", {
      queueName: "MySubscription_DLQ",
      retentionPeriod: cdk.Duration.days(14),
    });

    // subscribe queue to the topic
    
    // we have also defined a filter policy here. The queue will only recieve events from SNS if the the filter policy is
    // satisfied

    // we have also assigned a dead letter queue to store the failed events

    myTopic.addSubscription(
      new subscriptions.SqsSubscription(myQueue, {
        filterPolicy: {
          test: sns.SubscriptionFilter.stringFilter({
            whitelist: ["test"],
          }),
        },
        deadLetterQueue: dlQueue
      })
    );
  }
}
