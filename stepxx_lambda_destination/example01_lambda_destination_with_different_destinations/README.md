# Lambda Destinations as Different Destinations

This project combines Lambda Destinations with Destinations as SNS and Lambda to show you that with defining Success and Failure of lambda  will redirect the events to the specific destination.

An important point about Lambda Destinations is that they have to be executed asynchronously which is why the lambda is invoked via SNS in this pattern.

## Architechture

![alt text](https://github.com/panacloud-modern-global-apps/full-stack-serverless-cdk/blob/main/stepxx_lambda_destination/example01_lambda_destination_with_different_destinations/img/lambda-sns.png)

## When Lambda Destination will invoke

Lambda destination will be only invoke as a result of any invocation through Asynchronous Behaviours

![alt text](https://github.com/panacloud-modern-global-apps/full-stack-serverless-cdk/blob/main/stepxx_lambda_destination/example00_lambda_destination_event_bridge/img/destinations.png)

## How To Test Pattern

After you deploy this pattern you will have an API Gateway with one endpoint. You can test using curl or postman. This will be a post request endpoint. you just need to pass the data on the body for Success.
```
{
    "Success": true
}
```
and this for failure
```
{
    "Success": false
}
```

You will get an email on success and onfailure you can check the logs on cloudwatch.

Please change the email with your email in SNS email topic subscribe in the cdk code.