import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as sns from "@aws-cdk/aws-sns";
import * as s3notify from "@aws-cdk/aws-s3-notifications";

export interface NotifyingBucketProps {
  prefix?: string;
}

export class NotifyingBucket extends cdk.Construct {
  public readonly topic: sns.Topic;

  constructor(scope: cdk.Construct, id: string, props: NotifyingBucketProps) {
    super(scope, id);
    const bucket = new s3.Bucket(this, "bucket");
    this.topic = new sns.Topic(this, "topic");
    bucket.addObjectCreatedNotification(
      new s3notify.SnsDestination(this.topic),
      { prefix: props.prefix }
    );
  }
}
