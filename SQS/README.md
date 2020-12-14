# Amazon Simple Queue Service (SQS)

## Introduction

SQS is a very important service for **Event driven architecture**. It is usually a key component of our **messaging system**. We will send our events or messages to the SQS queue and it will have a consumer that `pulls` messages from that queue and processes them, this can be done in batches. This way SQS is able to store our events in the form of a queue. 

<!-- This will look very similar to **eventbridge** where we also have a central bus where we send our messages but in this case those messages can only be processed by one single consumer at a time. -->


## How it works

**Note** that SQS will not send messages to its consumers by itself, the consumers will have to **PULL** messages from the queue. 

Whenever a message is requested by a consumer, the SQS service marks that message as hidden but does not delete it.


## Usecases

### Interesting patterns to look at 

1. [Call me Maybe](https://youtu.be/9IYpGTS7Jy0?t=1476)
    - ![call me maybe architecture](images/call-me-maybe-arch.png)
    - This can also be viewed on cdkpatterns as [The scalable webhook](https://github.com/cdk-patterns/serverless/blob/master/the-scalable-webhook/README.md)
2. [The Big Fan](https://youtu.be/9IYpGTS7Jy0?t=1808)
    - ![big-fan architecture](images/the-big-fan-arch.png)
    - This can also be viewed on cdkpatterns as [The Big Fan](https://github.com/cdk-patterns/serverless/tree/master/the-big-fan/typescript)

When do we use SQS? In an event driven serverless application it is very common to see SQS being used as a **buffer**. Consider the example where we have a very popular website that has users placing 100,000 orders every minute, But the order processing system that we created is slow and only able to work with 10,000 orders every minute. If we directly connected our order processing sytem to our website with an API call then our system will not be able to handle so much load and it will result in errors and lockdown.

To avoid this situation where we have a slow downstream consumer, we can put an SQS queue in between the API and our order processing system. This way all the orders will keep getting stored inside the SQS queue and our order processing system will be able to pull the orders at the speed which it is able to handle.