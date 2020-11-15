[CDK for beginners](https://levelup.gitconnected.com/aws-cdk-for-beginners-e6c05ad91895)

[Study AWS CDK Workshop follow the TypeScript Path](https://cdkworkshop.com/)

mkdir step01_hello_lambda

cdk init app --language typescript

Installing Bootstrap Stack

For Lambda functions we will need to do [bootstrapping](https://docs.aws.amazon.com/cdk/latest/guide/bootstrapping.html) becuase they require [assets](https://docs.aws.amazon.com/cdk/latest/guide/assets.html) i.e. handler code that will be bundleded with the CDK library etc. and stored in S3 bootstraped bucket:

cdk bootstrap

npm run watch

[Now follow the Hello Lambda Workshop Chapter](https://cdkworkshop.com/20-typescript/30-hello-cdk/200-lambda.html)

Write a Lambada function in lambda/hello.js

Add your lambda construct in lib/step01_hello_lambda-stack.ts

cdk deploy

Now test the function in AWS Lambda Console (make sure you are in the correct region):

https://console.aws.amazon.com/lambda/home#/functions

Next step is to add an API Gateway in front of our function. 

npm install @aws-cdk/aws-apigateway

cdk deploy 

Get the URL from the output and test it using curl or paste the url in browser:

curl https://xxxxxx.execute-api.us-east-2.amazonaws.com/prod/

Now lets learn to run and test Lambdas locally

[Run lambda function locally](https://docs.aws.amazon.com/cdk/latest/guide/sam.html)

Note: Note SAM should be installed and Docker running

cdk synth --no-staging > template.yaml

Find the logical ID for your Lambda function in template.yaml. It will look like HelloHandler2E4FBA4D, where 2E4FBA4D represents an 8-character unique ID that the AWS CDK generates for all resources. The line right after it should look like:

Type: AWS::Lambda::Function

sam local invoke HelloHandler2E4FBA4D --no-event

cdk destroy

Other Reading References:

https://tlakomy.com/run-cdk-lambda-function-locally

Single Stack Project commands to run locally (SAM and Docker installed and Docker running):

cdk synth --no-staging > template.yaml

sam local start-api

Multi Stack Project commands to run locally (SAM and Docker installed and Docker running):

cdk synth --no-staging

cd cdk.out

sam local start-api -t {stackname}.template.json

[Running API Gateway locally](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-using-start-api.html)











# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
