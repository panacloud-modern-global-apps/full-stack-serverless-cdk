# Constructs as Cloud components

## Introduction

### What is a Construct?

[Constructs](https://docs.aws.amazon.com/cdk/latest/guide/constructs.html) are the basic building blocks of AWS CDK apps. A construct can represent a single resource, such as an Amazon Simple Storage Service (Amazon S3) bucket, or it can represent a higher-level component consisting of multiple AWS resources.

Just like we did with react where we made reusable UI-components. With the cdk we can use these constructs to create reusable `cloud components`. For example, we might want to have a custom cloud component that allows us to store files and whenever we make changes to files it sends us SNS notifications. This can be done by creating a custom construct :

```typescript
export interface NotifyingBucketProps {
  prefix?: string;
}

export class NotifyingBucket extends Construct {
  public readonly topic: sns.Topic;

  constructor(scope: Construct, id: string, props: NotifyingBucketProps) {
    super(scope, id, props);
    const bucket = new s3.Bucket(this, "bucket");
    this.topic = new sns.Topic(this, "topic");
    bucket.addObjectCreatedNotification(
      new s3notify.SnsDestination(this.topic),
      { prefix: props.prefix }
    );
  }
}
```

You can read further details of creating custom constructs from the [AWS Docs](https://docs.aws.amazon.com/cdk/latest/guide/constructs.html#constructs_author).

## Resources:

[You can view different cloud components made from cdk-constructs in this github repo.](https://github.com/cloudcomponents/cdk-constructs)
