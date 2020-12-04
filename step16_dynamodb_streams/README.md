# DynamoDB Streams

## Sources

- [DynamoDB Streams Use Cases and Design Patterns - 2017](https://aws.amazon.com/blogs/database/dynamodb-streams-use-cases-and-design-patterns/#:~:text=DynamoDB%20Streams%20is%20a%20powerful,for%20up%20to%2024%20hours.)
- [AWS Docs](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html)
- [CDK Construct Library Docs](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-lambda-event-sources-readme.html#dynamodb-streams)
- [Example use cases video](https://www.youtube.com/watch?v=OjppS4RWWt8)

## Introduction

Streams stores all updates made to records in a dynamodb table for upto 24 hours. It also keeps track of the order in which the updates were made.

There are 4 options regarding what information is stored in the stream. This is called `view type`:

1. KEYS_ONLY
2. NEW_IMAGE
3. OLD_IMAGE
4. NEW_AND_OLD_IMAGES

We are going to create a table to store individual orders at a store and then we will use a separate table to store aggregates of different items. We will do this by having a lambda function process the dynamodb stream and add the totals.

<!-- Maybe add an architecture diagram image here(its just going to be ddbtable => stream => lambda => ddbtable) -->

## Implementation

```typescript
const ordersTable = new dynamodb.Table(this, "OrdersTable", {
  partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
  stream: dynamodb.StreamViewType.NEW_IMAGE,
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
});
```

It is very simple to enable DynamoDB Streams for a table, all we have to do is to specify a view type for the stream field when we are creating a new table.

We can then attach a simple echo lambda to print the NEW_IMAGE after update to the cloudwatch logs.

```typescript
const echoLambda = new lambda.Function(this, "echoLambda", {
  code: lambda.Code.fromInline(
    "exports.handler = (event,context) => {console.log(event.Records.map(item=>Object.entries(item.dynamodb.NewImage))); context.succeed(event);}"
  ),
  handler: "index.handler",
  runtime: lambda.Runtime.NODEJS_10_X,
});

echoLambda.addEventSource(
  new DynamoEventSource(ordersTable, {
    startingPosition: lambda.StartingPosition.LATEST,
    batchSize: 5,
    bisectBatchOnError: true,
    onFailure: new SqsDlq(deadLetterQueue),
    retryAttempts: 10,
  })
);
```

## Cleanup

```
cdk destroy
```
