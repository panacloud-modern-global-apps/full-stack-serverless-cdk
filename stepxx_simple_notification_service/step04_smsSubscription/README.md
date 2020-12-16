# Subscribing SMS to an SNS topic

## Code Explanation

### Creating an SNS topic

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

### Subscribing SMS to the topic

Enter your number in the "SmsSubscription(...)" method (shown below).

The filter policy here sets a rule that only those messages would be recieved by the subscribed number that have a "message attribute" named "test" with a value of greater than 100

```javascript
 
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
```


## Usage

After deploying the code you can start publishing messages from the SNS console. Be mindful of the filer policy that we applied. You will have to add a message attribue named "test" with a value of greater than 100, otherwise, you would not be able to recieve the messages on your number.

You can change the filter policy and play around with it to understand it better. There are many different filters that you can apply. You can find them in the documentations.
