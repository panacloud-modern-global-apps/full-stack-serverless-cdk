# How to deploy a lambda function with multiple layers using CDK

In this example you will learn, that how to deloy a lambda function with multiple lambda layers using CDK. For this tutorial I prefer this [video](https://www.youtube.com/watch?v=i12H4cUFudU "vidoe").

### Step 1: Setup a CDK directory
`cdk init app --language typescript`

### Step2: Install following dependency
`npm install @aws-cdk/aws-lambda`

### Step3: Setup Lambda function
Create a new folder as **lambda-fns** in the cdk root dir and add a file as **lambda.ts**.
```javascript
// lambda-fns/lambda.ts

const random_name = require('/opt/randomName');
const axios = require('axios');

exports.handler = async (event: any, context: any) => {

    const name = random_name.getName();
    const result = await axios.get('https://jsonplaceholder.typicode.com/todos/1');

    console.log("Random Name ==>", name);
    console.log("Random Fetch ==>", result.data);

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: {
            randomName: name,
            randomFetch: result.data,
        },
    }
}
```
> **Note:** Make sure do not add any dependencies which is imported in the lambda code. We will add these dependencies with the help of lambda layers which we will cover in the next step. One more thing that you have noticed `const random_name = require('/opt/randomName');` in this line that why we importing from `'/opt/randomName'`? This is because any file you are importing from the lambda layer, it will be available inside `opt`. 

### Step4: Setup Lambda Layer
Create a new folder as **lambda-layers** in the cdk root directory and inside that create two new folders as **http** and **nameGenerator**. After that create **nodejs** folder inside both the **http** and **nameGenerator** folders and do the following steps.
- Run the following commands inside **http/nodejs**
1. `npm init -y`
1. `npm install axios`

- Run the following commands inside **nameGenerator/nodejs**
1. `npm init -y`
1. `npm install node-random-name`


- Add **randomName.ts** inside **nameGenerator** folder and add the following code.

```javascript
// nameGenerator/randomName.ts
const randomName = require('node-random-name');

exports.getName = () => {
    return randomName();
};
```
> **Note:** Make sure that the folder **nodejs** that you have created, that name should be "nodejs" because during deployment this folder will be added into zip file and uploaded to the aws so when your lambda will try to call any module which is not available in it's root directory then your lambda will try to extract that module from "nodejs" which is present in your attached layer and as we are working in nodejs environment this format will be required, otherwise if you named it randomly your lambda will generate an error. Like wise if you are using python environment so instead of "nodejs" you will make "python" folder with having all python dependencies.

### Step5: Setup Your CDK Stack
```javascript
// lib/stack.ts

import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';

export class Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const httpLayer = new lambda.LayerVersion(this, "HttpLayer", {
      code: lambda.Code.fromAsset('lambda-layers/http'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_12_X], // optional 
    })
    const nameGenerator = new lambda.LayerVersion(this, "NameGeneratorLayer", {
      code: lambda.Code.fromAsset('lambda-layers/nameGenerator'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_12_X], // optional 
    })

    new lambda.Function(this, "LambdaWithLayer", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('lambda-fns'),
      handler: 'lambda.handler',
      layers: [httpLayer, nameGenerator],
    })
  }
}

```
### Step6: Lets deploy
After completing the above steps run the following commands to deploy
- `npm run build`
- `cdk deploy`

### Step7: Test Your Lambda
Now at last if every things done according to the steps above, just go to your lambda console and test you lambda.
[How to test a lambda function in aws console](https://www.youtube.com/watch?v=seaBeltaKhw&feature=youtu.be&t=310 "How to test a lambda function in aws console")

 
Your can also check the lambda layers in your aws console. Go to your **Code** tab scroll down and you can see the lambda layer
![img](images/img1.jpg)
       
![img](images/img2.jpg)
