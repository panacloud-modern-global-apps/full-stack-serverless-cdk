# How to deploy a lambda function with single layer using CDK

In this example you will learn, that how to simply deloy a lambda function with single lambda layer using CDK, which is very easy to do.

### Step 1: Setup a CDK directory
`cdk init app --language typescript`

### Step2: Install following dependency
`npm install @aws-cdk/aws-lambda`

### Step3: Setup Lambda function
Create a new folder as **lambda-fns** in the cdk root dir and add a file as **lambda.ts**.
```javascript
// lambda-fns/lambda.ts

const axios = require('axios');

exports.handler = async (event: any, context: any) => {
    const result = await axios.get('https://jsonplaceholder.typicode.com/todos/1');
    return result.data;
}
```
> **Note:** Make sure do not add the axios dependency in your lambda folder. We will add the dependency with the help of lambda layer which we will cover in the next step.

### Step4: Setup Lambda Layer
Create a new folder as **lambda-layer** in the cdk root dir and add new folder as **nodejs** inside **lambda-layer**. 
Inside **nodejs** run the following commands.
`npm init -y`
`npm install axios`
> **Note:** Make sure that the folder **nodejs** that you have created, that name should be "nodejs" because during deployment this folder will be converted into zip file and uploaded to the aws so when your lambda will call this layer its name should be "nodejs" as you are working in nodejs environment, otherwise if you named it randomly the layer will not called by the lambda function and will result in error. Like wise if you are using python environment so instead of "nodejs" you will make "python" folder with having all python dependencies.

### Step5: Setup Your CDK Stack
```javascript
// lib/stack.ts

import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';

export class stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const lambdaLayer = new lambda.LayerVersion(this, "LambdaLayer", {
      code: lambda.Code.fromAsset('lambda-layer'),
    })

    new lambda.Function(this, 'LambdaWithLambdaLayer', {
      runtime: lambda.Runtime.NODEJS_12_X, // execution environment
      code: lambda.Code.fromAsset('lambda-fns'),  // code loaded from the "lambda" directory
      handler: 'lambda.handler',  // file is "lambda", function is "handler"
      layers: [lambdaLayer]
    })
  }
}
```
### Step6: Lets deploy
After completing the above steps run the following commands to deploy
`npm run build`
`cdk deploy`
