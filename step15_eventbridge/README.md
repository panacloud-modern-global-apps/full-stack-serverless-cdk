# Eventbridge and Lambdas

## Introduction

Eventbridge plays the role of an _event router_.

It has 4 main parts:

- Events
  ```json
  // This is what a basic event looks like
  {
    "version": "******",
    "id": "******",
    "account": "******",
    "region": "******",
    "time": "******",
    "resources": [],
    "source": "******", // we can customize this
    "detail-type": "******", // we can customize this
    "detail": {
      "country": "PK",
      "item": "BIRYANI",
      "customerID": "001"
    }
  }
  ```
- Rules
- Event Buses
- Targets

## Implementation

### Creating Lambda functions.

Here we create 2 lambda functions in our cdk, one producer function will create events and push them to eventbridge and the other consumer function will get triggered by events from eventbridge that match a rule that we will define.

```typescript
// lib/cdk-stack.ts

const producerFn = new lambda.Function(this, "producerLambda", {
  runtime: lambda.Runtime.NODEJS_12_X,
  code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
  handler: "producer.handler",
});
// Grant the lambda permission to put custom events on eventbridge
events.EventBus.grantPutEvents(producerFn);

const consumerFn = new lambda.Function(this, "consumerLambda", {
  runtime: lambda.Runtime.NODEJS_12_X,
  code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
  handler: "consumer.handler",
});
```

#### Producer Lambda Code

This lambda function will create a custom event on our default event bus

```typescript
// lambda/producer.js
const AWS = require("aws-sdk");

function helper(body) {
  const eventBridge = new AWS.EventBridge({ region: "eu-west-1" }); // write whatever region your event bus is in.

  return eventBridge
    .putEvents({
      Entries: [
        {
          // Name of the event bus to which to send event
          EventBusName: "default",
          // give any custom name to source
          Source: "custom.api",
          // give any description of payload
          DetailType: "order",
          // This Detail is the actual payload, we can add whatever we want here
          Detail: `{ "country": "${body.country}" }`,
        },
      ],
    })
    .promise();
}

exports.handler = async function (event, context) {
  console.log("EVENT BODY: \n", event.body);
  const ev = await helper(JSON.parse(event.body));
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html" },
    body: `<h1>Event Published to Eventbridge</h1>${JSON.stringify(ev,null,2)}`,
  };
};
```

#### Consumer Lambda

This lambda function to simply log event that it has been called with by event bridge

```typescript
// lambda/consumer.js
exports.handler = async function (event, context) {
  console.log("EVENT: \n" + JSON.stringify(event, null, 2));
  return context.logStreamName;
};
```

### Create Rule on our Bus.

Now we will filter the events on our event bus and only send the events that follow this pattern to our lambda function.

```typescript
// create a rule on our custom event bus with target as lambda.
new events.Rule(this, "orderPKLambda", {
  targets: [new targets.LambdaFunction(consumerFn)],
  description:
    "Filter events that come from country PK and invoke lambda with it.",
  eventPattern: {
    detail: {
      country: ["PK"],
    },
  },
});
```

### Testing our Architecture.

#### Viewing Console.log result of lambda functions.
We can view the `console.logs` of our lambda functions by:
1. Going to our aws console and going to `lambda`.
2. Selecting our function.  
3. Choosing `Monitoring`. ![](s1.png)
4. Clicking on `View logs in Cloudwatch` ![](s2.png)
5. Select a logstream folder
6. Click to expand the console logs   
>Producer Logs:
>![producer logs](s3.png)  

>Consumer Logs:
>![consumer logs](s4.png)

#### Actually Testing 

Lets test our event bus by first throwing some random events that do not follow our pattern, we see that our consumer lambda does not get invoked. Now when we send the proper event that matches our lambda then we see that it gets triggered.

We have setup a simple API to which we send json data. We can either just use curl on our terminal or use any gui like postman to test it. We can go view the `cloudwatch` logs for our `consumer` lambda and see that it only gets triggered when we send `{"country":"PK"}`. 

```bash
curl -d '{"country":"NOT_PK"}' -H 'Content-Type: application/json' https://YOUR_API_ENDPOINT

curl -d '{"country":"IN"}' -H 'Content-Type: application/json' https://YOUR_API_ENDPOINT

curl -d '{"country":"PK"}' -H 'Content-Type: application/json' https://YOUR_API_ENDPOINT
```

## Extra: Working with Custom Event Busses.
**UPDATE (9-DEC-2020)** 
[Based on advice from this reinvent-2020 session](https://virtual.awsevents.com/media/Building+event-driven+applications+with+Amazon+EventBridge/1_y0g6c039) We should **not** be putting custom application events on the default event bus and instead create a custom event bus for our application, which is a very simple task as shown below.

You can also create custom event busses instead of using the default event bus. Snippet from the docs:

>Each event bus in your account can have up to 100 EventBridge rules associated with it, so if your account has many rules, you might want to create custom event buses to associate with some of the rules for your custom application events. Another reason to create custom event buses is to apply different permissions to different event buses. When you set permissions on an event bus, you can specify which other accounts or entire organizations can send events to the event bus.

There are 2 kinds of custom event busses. One is a compeletely custom bus where we send our custom events and control permissions. The other type is an event bus used to integrate with AWS SaaS partners like datadog.  
When using `aws-cdk` inorder to define an event bus we simply create a new EventBus and give it a name. If we give it a SourceName then it will be considered a SaaS partner event bus. [Event Bus cdk construct docs](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-events.EventBus.html)

```typescript
// creating a custom event bus
new events.EventBus(this, 'myEventBus', {
  eventBusName: 'custom-event-bus'
})

// creating a partner event bus
new events.EventBus(this, 'myEventBus', {
  eventSourceName: 'PARTNER_SOURCE_NAME'
})
```

Also be mindful of whether you need to generate custom events or if you can accomplish the same task with AWS's state change events due to this pricing model:
![eventbridge-pricing](https://i.imgur.com/DnWWJ6Z.png)
