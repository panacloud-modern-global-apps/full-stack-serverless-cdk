# Publishing data on an SNS topic using eventbridge

## Code Explanation

### Creating an Appsync Api mutation to fire an event on the eventbridge

Here we have created an appsync API. This API has a mutation that triggers an event on the eventbridge

```javascript
    // API
    const api = new appsync.GraphqlApi(this, "Api", {
      name: "appsyncEventbridgeAPI",
      schema: appsync.Schema.fromAsset("schema/schema.graphql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
      },
      logConfig: { fieldLogLevel: appsync.FieldLogLevel.ALL },
      xrayEnabled: true,
    });

    // HTTP DATASOURCE
    const httpDs = api.addHttpDataSource(
      "ds",
      "https://events." + this.region + ".amazonaws.com/", // This is the ENDPOINT for eventbridge.
      {
        name: "httpDsWithEventBridge",
        description: "From Appsync to Eventbridge",
        authorizationConfig: {
          signingRegion: this.region,
          signingServiceName: "events",
        },
      }
    );
    events.EventBus.grantPutEvents(httpDs);

    // RESOLVER
    const putEventResolver = httpDs.createResolver({
      typeName: "Mutation",
      fieldName: "createEvent",
      requestMappingTemplate: appsync.MappingTemplate.fromFile("request.vtl"),
      responseMappingTemplate: appsync.MappingTemplate.fromFile("response.vtl"),
    });
    
```

### Create an SNS topic

```javascript

// create an SNS topic
    const myTopic = new sns.Topic(this, "MyTopic");

```

### Creating a dead letter queue

We are using SQS to create a dead letter queue. The dead letter queue can be used in with SNS to store all the failed messages and perform some action on them.

```javascript

 // create a dead letter queue

    const dlQueue = new sqs.Queue(this, "DeadLetterQueue", {
      queueName: "MySubscription_DLQ",
      retentionPeriod: cdk.Duration.days(14),
    });


```

### Subscribing Email to the topic

Enter your email in the "EmailSubscription(...)" method (shown below). 

```javascript

   // subscribe email to the topic
    myTopic.addSubscription(
      new subscriptions.EmailSubscription("ADD YOUR EMAIL HERE", {
        json: false,
        deadLetterQueue: dlQueue,
      })
    );
```


### Creating an eventbridge rule and assigning it to our SNS topic

Here we have added SNS topic as a target to the rule so that everytime an event is generated, it gets published to the topic and the topic can send it to the subscribed Email address.

```javascript

 // create a rule to publish events on SNS topic
    const rule = new events.Rule(this, "AppSyncEventBridgeRule", {
      eventPattern: {
        source: ["eru-appsync-events"], // every event that has source = "eru-appsync-events" will be sent to SNS topic
      },
    });

    // add the topic as a target to the rule created above
    rule.addTarget(new targets.SnsTopic(myTopic));
```


## Usage

After deploying the code you will recieve an email from AWS to confirm your subscription. Follow the steps in the email to confirm the subsription. You can then run the Appsync mutation from the AWS Appsync console and you will recieve the generated event in your email.
