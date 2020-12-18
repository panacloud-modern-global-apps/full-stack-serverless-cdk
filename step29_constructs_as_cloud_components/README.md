# Constructs as Cloud components

## Introduction

### What is a Construct?

[Constructs](https://docs.aws.amazon.com/cdk/latest/guide/constructs.html) are the basic building blocks of AWS CDK apps. A construct can represent a single resource, such as an Amazon Simple Storage Service (Amazon S3) bucket, or it can represent a higher-level component consisting of multiple AWS resources.

Just like we did with react where we made reusable UI-components. With the cdk we can use these constructs to create reusable `cloud components`. For example, we might want to have a custom cloud component that allows us to store files and whenever we make changes to files it sends us SNS notifications. This can be done by creating a custom construct.

You can read further details of creating custom constructs from the [AWS Docs](https://docs.aws.amazon.com/cdk/latest/guide/constructs.html#constructs_author).

>The class constructors have the signature (scope, id, props). Constructs are always created in the scope of another construct and must always have an identifier which must be unique within the scope it’s created. Therefore, construct initializers (constructors) will always have the following signature:

>- **scope**: the first argument is always the scope in which this construct is created. In almost all cases, you’ll be defining constructs within the scope of **current** construct, which means you’ll usually just want to pass this for the first argument. Make a habit out of it.
>- **id**: the second argument is the local identity of the construct. It’s an ID that has to be unique amongst construct within the same scope. The CDK uses this identity to calculate the CloudFormation [Logical ID](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/resources-section-structure.html) for each resource defined within this scope. **To read more about IDs in the CDK, see the** [CDK user manual](https://docs.aws.amazon.com/cdk/latest/guide/identifiers.html#identifiers_logical_ids).
>- **props**: the last (sometimes optional) argument is always a set of initialization properties. Those are specific to each construct. For example, the `lambda.Function` construct accepts properties like runtime, code and handler. You can explore the various options using your IDE’s auto-complete or in the [online documentation](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-lambda-readme.html).

## Implementation

We create a directory to store our custom construct and create this notifyBucket Construct.

```typescript
// constructs/notifyBucket.ts

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

Then we simply import it in whatever `Stack` we want and use it like a normal construct.

```typescript
// Importing our custom construct
import { NotifyingBucket } from "../constructs/notifyBucket";

const testBucket = new NotifyingBucket(this, "notifyingTestBucket", {
  prefix: "test/",
});
```

## Resources:

[You can view different cloud components made from cdk-constructs in this github repo.](https://github.com/cloudcomponents/cdk-constructs)

## Cleanup

```
cdk destroy
```
