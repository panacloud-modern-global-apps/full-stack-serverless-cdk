# Lambda Destinations as Event Bridge

This project combines Lambda Destinations with Amazon EventBridge to show you that with EventBridge rules you can decouple your components in an event driven architecture and by combining it with lambda destinations you can strip out EventBridge specific code from your lambda functions themselves and decouple further.
An important point about Lambda Destinations is that they have to be executed asynchronously which is why the lambda is invoked via SNS in this pattern.

## Architechture

![alt text](https://github.com/panacloud-modern-global-apps/full-stack-serverless-cdk/blob/main/stepxx_lambda_destination/example00_lambda_destination_event_bridge/img/lambda-destination.png)
