# Subscribing SQS to an SNS topic

## Code Explanation

### Creating an SNS topic


```javascript

      // create an SNS topic
    const myTopic = new sns.Topic(this, "MyTopic");
    
```

### Creating a subscription queue

This queue would subscribe to the topic

```javascript
// create a queue for subscription

    const myQueue = new sqs.Queue(this, "MyQueue");
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

### Subscribing SQS to the topic


We have added a dead letter queue as well as a filter policy in this subscription. 

The filter policy here sets a rule that only those messages would be recieved by the subscribed queue that have a "message attribute" named "test" with a string value of "test"

```javascript
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
```


## Usage

After deploying the code you can start publishing messages from the SNS console. Be mindful of the filer policy that we applied. You will have to add a message attribue named "test" with a string value of "test", otherwise, your queue would not be able to recieve them.

You can change the filter policy and play around with it to understand it better. There are many different filters that you can apply. You can find them in the documentations.
