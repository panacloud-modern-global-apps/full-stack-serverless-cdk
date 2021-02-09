# Lambda Edge

## Introduction 
Lambda@Edge is a feature of Amazon CloudFront that lets you run code closer to users of your application, which improves performance and reduces latency. With Lambda@Edge, you don't have to provision or manage infrastructure in multiple locations around the world

## Code Explanation
### Step 1: Setup a CDK directory
`cdk init app --language typescript`

### Step2: Install following dependencies

`npm i @aws-cdk/aws-lambda`

`npm i @aws-cdk/aws-cloudfront`

`npm i '@aws-cdk/aws-cloudfront-origins`

`npm i @aws-cdk/aws-s3`

### Step3: Setup Your lambda Edge function
Its setup is almost same as normal lambda function.
```javascript
 const myFunc = new cloudfront.experimental.EdgeFunction(this, 'MyFunction', {
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
    });
```
### Step4:Create an S3 bucket
```javascript
    const myBucket = new s3.Bucket(this, 'myBucket');
```
### Step5:Setup cloudfront and add your lambda function

```javascript

    new cloudfront.Distribution(this, 'myDist', {

      defaultBehavior: {
        origin: new origins.S3Origin(myBucket),

        edgeLambdas: [
          {
            functionVersion: myFunc.currentVersion, // Add your lambda function here
            eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,// Add your lambda edge event type here
          }
        ],
      },
    });
```    
