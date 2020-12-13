# Lambda Destinations as Different Destinations

This project combines Lambda Destinations with Destinations as SNS and Lambda to show you that with defining Success and Failure of lambda  will redirect the events to the specific destination.

An important point about Lambda Destinations is that they have to be executed asynchronously which is why the lambda is invoked via SNS in this pattern.

## Architechture

![alt text](https://github.com/panacloud-modern-global-apps/full-stack-serverless-cdk/blob/main/stepxx_lambda_destination/example01_lambda_destination_with_different_destinations/img/lambda-sns.png)

