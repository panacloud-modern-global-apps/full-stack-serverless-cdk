# Introduction

Amazon Simple Notification Service (Amazon SNS) is a managed service that provides message delivery from publishers to subscribers (also known as producers and consumers). Publishers communicate asynchronously with subscribers by sending messages to a topic, which is a logical access point and communication channel. Clients can subscribe to the SNS topic and receive published messages using a supported protocol, such as Amazon SQS, AWS Lambda, HTTP, email, mobile push notifications, and mobile text messages (SMS). 

>SNS block diagram:

>![SNS block diagram](imgs/intro.png)  

To learn more about SNS [click here](https://docs.aws.amazon.com/sns/latest/dg/welcome.html)

You can find more information on how to use SNS with AWS CDK [here](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-sns-readme.html) and [here](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-sns-subscriptions-readme.html)
