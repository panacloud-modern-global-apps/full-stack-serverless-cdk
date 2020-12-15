# Lambda Destinations as Event Bridge

This project combines Lambda Destinations with Amazon EventBridge to show you that with EventBridge rules you can decouple your components in an event driven architecture and by combining it with lambda destinations you can strip out EventBridge specific code from your lambda functions themselves and decouple further.
An important point about Lambda Destinations is that they have to be executed asynchronously which is why the lambda is invoked via SNS in this pattern.

## Architechture

![alt text](https://github.com/panacloud-modern-global-apps/full-stack-serverless-cdk/blob/main/stepxx_lambda_destination/example00_lambda_destination_event_bridge/img/lambda-destination.png)

## When Lambda Destination will invoke

Lambda destination will be only invoke as a result of any invocation through Asynchronous Behaviours

![alt text](https://github.com/panacloud-modern-global-apps/full-stack-serverless-cdk/blob/main/stepxx_lambda_destination/example00_lambda_destination_event_bridge/img/destinations.png)

## Overview

### Step1

Connect a lmabda to an api gateway while attaching some policies, this lambda will publish the message on topic whne the apigateway is called.

```javascript
    const mainLambda = new lambda.Function(this, 'mainLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'index.handler',
      environment: {
        TOPIC_ARN : myTopic.topicArn
      }
    });

    mainLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["sns:*"],
        resources: ["*"]
      })
    );

    const api = new apigw.LambdaRestApi(this, "Endpoint", {
      handler: mainLambda,
    });
```

### Step2

Create an event bus and initialize an SNS topic and also add a lambda subscription to the topic. This lambda is a destination lambda defining success and failure path as event bridge destination.

```javascript
    const bus = new event.EventBus(this, "EventBus", {
      eventBusName: 'ExampleEventBus'
    })

    const myTopic = new sns.Topic(this, 'MyTopic');

    const destinedLambda = new lambda.Function(this, 'DestinationLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'destined.handler',
      retryAttempts: 0,
      onSuccess: new destinations.EventBridgeDestination(bus),
      onFailure: new destinations.EventBridgeDestination(bus)
    });

    myTopic.addSubscription(new subs.LambdaSubscription(destinedLambda));
```

### Step3

This destination lambda will return the data on complete execution along with some extra information like source and action (it will be anything you want that you can catch in your event Rules).

```javascript
    exports.handler = async (event: any) => {
        console.log("request:", JSON.stringify(event, undefined, 2));
        
        return {
            source: 'event-success',
            action: 'data',
            data: "Hello world"
        };
    }
```

## Step4

This event rule will match on success execution of lambda.
Note: Lambda destination return a large object of events in which `responsePayload` has the data will be return by the actual lambda.

```javascript
    const successLambda = new lambda.Function(this, 'SuccesserLambdaHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'success.handler'
    });

    const successRule = new event.Rule(this, 'successRule', {
      eventBus: bus,
      eventPattern:
      {
        "detail": {
          "responsePayload": {
            "source": ["event-success"],
            "action": ["data"]
          }
        }
      },
      targets : [
        new target.LambdaFunction(successLambda)
      ]
    });
```

## How To Test Pattern

After you deploy this pattern you will have an API Gateway with one endpoint. You can test using curl or postman and check the cloudwatch events for invocation tests.


