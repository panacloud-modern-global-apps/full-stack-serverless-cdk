# Lambda Destination!

AWS Lambda Destinations is mainly for asynchronous invocations. This is a feature that provides visibility into Lambda function invocations and routes the execution results to AWS services, simplifying event-driven applications and reducing code complexity.

## Asynchronous invocations

When a function is invoked asynchronously, Lambda sends the event to an internal queue. A separate process reads events from the queue and executes your Lambda function. When the event is added to the queue, Lambda previously only returned a 2xx status code to confirm that the queue has received this event. There was no additional information to confirm whether the event had been processed successfully.

A common event-driven microservices architectural pattern is to use a queue or message bus for communication. This helps with resilience and scalability. Lambda asynchronous invocations can put an event or message on Amazon Simple Notification Service (SNS), Amazon Simple Queue Service (SQS), or Amazon EventBridge for further processing. Previously, you needed to write the SQS/SNS/EventBridge handling code within your Lambda function and manage retries and failures yourself.

[More on Lambda Destination](https://aws.amazon.com/blogs/compute/introducing-aws-lambda-destinations/)

## Destinations
 You can route the lambda function execution status to four destinations.
 1. Lambda Fucntion
 2. SNS
 3. SQS
 4. EventBridge

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
