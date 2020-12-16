# Subscribing Email to an SNS topic

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


## Usage

After deploying the code you will recieve an email from AWS to confirm your subscription. Follow the steps in the email to confirm the subsription. You can then send messages from your SNS console to test the code
