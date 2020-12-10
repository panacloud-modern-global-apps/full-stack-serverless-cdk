
[CDK for beginners](https://levelup.gitconnected.com/aws-cdk-for-beginners-e6c05ad91895)

[Study AWS CDK Workshop follow the TypeScript Path](https://cdkworkshop.com/)



# Steps to compile the code

## step 1 
make a new folder for your cdk project

```
mkdir step01_hello_lambda
```

## step 2
intialize your cdk project in typescript by running the following command

```
cdk init app --language typescript
```

## step 3
run the following command to build your ts files in real-time. This process needs to keep running in the background so it is best if you run it in a seperate terminal

```
npm run watch
```

## step 4
Initialize your lambda function 

```
  const hello = new lambda.Function(this, "HelloHandler", {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "hello.handler",
    });

```

## step 5
add the handler code for your lambda in lambda/hello.ts
```
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  console.log("request:", JSON.stringify(event, undefined, 2));

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello, CDK! You've hit ${event.path}\n`
  };
}
```


## step 6
Installing Bootstrap Stack. 
For Lambda functions we will need to do [bootstrapping](https://docs.aws.amazon.com/cdk/latest/guide/bootstrapping.html) becuase they require [assets](https://docs.aws.amazon.com/cdk/latest/guide/assets.html) i.e. handler code that will be bundleded with the CDK library etc. and stored in S3 bootstraped bucket:

```
cdk bootstrap
```


## Step 7 (optional)

Run the following command to see the cloud formation template of your cdk code.

```
cdk synth
```

## Step 8 (optional)

Run the following command to see the difference between the new changes that you just made and the code that has already been deployed on the cloud.
```
cdk diff
```


## Step 9 

Run the following command to deploy your code to the cloud. 

```
cdk deploy
```

if you did not run "npm run watch" in the step 4 then you need to build the project before deployment by running the folliwng command. npm run build will also compile typescript files of the lambda function

```
npm run build && cdk deploy
```

## step 10

Now test the function in AWS Lambda Console (make sure you are in the correct region):
https://console.aws.amazon.com/lambda/home#/functions


## step 11

Next step is to add an API Gateway in front of our function. Install the dependency: npm install @aws-cdk/aws-apigateway

```
new apigw.LambdaRestApi(this, "Endpoint", {
      handler: hello,
    });
```


## step 12

deploy again 

```
cdk deploy
```

## step 13

Get the URL from the output and test it using curl or paste the url in browser:

curl https://xxxxxx.execute-api.us-east-2.amazonaws.com/prod/


# steps to test the lambda function locally


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

Class Videos:

[Step 01 and 02 Class Video in English on Facebook](https://www.facebook.com/zeeshanhanif/videos/10225216995316823)

[Step 01 and 02 Class Video in English on YouTube](https://www.youtube.com/watch?v=JpLNn3_GbIc)

[Step 01 and 02 Class Video in Urdu on Facebook](https://www.facebook.com/zeeshanhanif/videos/10225226138185389)

[Step 01 and 02 Class Video in Urdu on YouTube](https://www.youtube.com/watch?v=IJBowlCR7fk)





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
