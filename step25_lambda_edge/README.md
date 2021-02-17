# Lambda Edge

## Introduction 
Lambda@Edge is a feature of Amazon CloudFront that lets you run code closer to users of your application, which improves performance and reduces latency. With Lambda@Edge, you don't have to provision or manage infrastructure in multiple locations around the world.

[Lambda Edge official Docs](https://aws.amazon.com/lambda/edge/)

[Lambda Edge CDK](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-cloudfront-readme.html#lambdaedge)

## Code Explanation
### Step 1: Setup a CDK directory
`cdk init app --language typescript`

### Step2: Install following dependencies

`npm i @aws-cdk/aws-lambda`

`npm i @aws-cdk/aws-cloudfront`

`npm i '@aws-cdk/aws-cloudfront-origins`

`npm i @aws-cdk/aws-s3`

### Step3: Setup Your lambda Edge function
Following code will create a lambda edge function.Its setup is almost same as a normal lambda function.
```javascript
 const myFunc = new cloudfront.experimental.EdgeFunction(this, 'MyFunction', {
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
    });
```
### Step4:Create an S3 bucket
Following code will create and S3 bucket.
```javascript
    const myBucket = new s3.Bucket(this, 'myBucket');
```
### Step5:Setup cloudfront and add your lambda function
Following code will deploy our lambda function to cloudfront CDN.
```javascript

    new cloudfront.Distribution(this, 'myDist', {

      defaultBehavior: {
        origin: new origins.S3Origin(myBucket),

        edgeLambdas: [
          {
            functionVersion: myFunc.currentVersion, // Add your lambda function version here.This is the version of the Lambda function that will be invoked.
            eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,// Add your lambda edge event type here.This is the type of event in response to which should the function be invoked.
          }
        ],
      },
    });
```   

[Step 25 and 26 Video in English on Facebook](https://www.facebook.com/zeeshanhanif/videos/10225866783121112)

[Step 25 and 26 Video in English on YouTube](https://www.youtube.com/watch?v=onx7b32jRcM)

[Step 25 and 26 Video in Urdu on Facebook](https://www.facebook.com/zeeshanhanif/videos/10225904417381945)

[Step 25 and 26 Video in Urdu on Facebook](https://www.youtube.com/watch?v=LfhS4kuJTaI)


 


