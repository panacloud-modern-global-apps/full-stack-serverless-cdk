# Cognito User pool with Lmabda Trigger

You can create an AWS Lambda function and then trigger that function during user pool operations such as user sign-up, confirmation, and sign-in (authentication) with a Lambda trigger. You can add authentication challenges, migrate users, and customize verification messages.

## Important Considerations
Except for Custom Sender Lambda triggers, Amazon Cognito invokes Lambda functions synchronously. When called, your Lambda function must respond within 5 seconds. If it does not, Amazon Cognito retries the call. After 3 unsuccessful attempts, the function times out. This 5-second timeout value cannot be changed. For more information see the Lambda programming model.

## User Pool Lambda Trigger Event

Amazon Cognito passes event information to your Lambda function which returns the same event object back to Amazon Cognito with any changes in the response. This event shows the Lambda trigger common parameters:

```json
    {
        "version": "string",
        "triggerSource": "string",
        "region": "string",
        "userPoolId": "string",
        "userName": "string",
        "callerContext": 
            {
                "awsSdkVersion": "string",
                "clientId": "string"
            },
        "request":
            {
                "userAttributes": {
                    "string": "string",
                    ....
                }
            },
        "response": {}
    }

```

[Read more at](https://docs.amazonaws.cn/en_us/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html)
