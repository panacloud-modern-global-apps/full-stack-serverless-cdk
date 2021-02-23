# How to deploy a lambda function with single layer using CDK

In this example you will learn, that [how to simply deloy a lambda function with single lambda layer](https://www.youtube.com/watch?v=-r4GJlkdJo0 "how to simply deloy a lambda function with single lambda") using CDK, which is very easy to do.

### Step 1: Setup a CDK directory
`cdk init app --language typescript`

<br>

### Step2: Install the following dependency
`npm install @aws-cdk/aws-lambda`

<br>

### Step3: Setup Lambda function
Create a new folder as **lambda-fns** in the cdk root dir and add a file as **lambda.py**.
```python
// lambda-fns/lambda.py

import requests
import json

def handler(event, context):        
    result = requests.get('https://jsonplaceholder.typicode.com/todos/1')            
    return result.json()
```
<br>

> **Note:** Make sure do not add the requests dependency in your lambda folder. We will add the dependency with the help of lambda layer which we will cover in the next step.

<br>

### Step4: Setup Lambda Layer
Create a new folder as **lambda-layer** in the cdk root dir and add new folder as **python** inside **lambda-layer**. 
Inside **python** create a file requirements.txt

```python
// lambda-layer/python/requirements.txt
requests==2.25.1
```
<br>

and run the following command
- `pip install -r requirements.txt -t .`


> **Note:** Make sure that the folder **python** that you have created, that name should be "python" because during deployment this folder will be added into zip file and uploaded to the aws so when your lambda will try to call any module which is not available in it's root directory then your lambda will try to extract that module from "python" which is present in your attached layer and as we are working in python environment this format will be required, otherwise if you named it randomly your lambda will generate an error. 

<br>

### Step5: Setup Your CDK Stack

```javascript
// lib/stack.ts

import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';

export class Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const lambdaLayer = new lambda.LayerVersion(this, "LambdaLayer", {
      code: lambda.Code.fromAsset('lambda-layer'),
    });

    new lambda.Function(this, 'LambdaWithLambdaLayer', {
      runtime: lambda.Runtime.PYTHON_3_7, // execution environment
      code: lambda.Code.fromAsset('lambda-fns'),  // code loaded from the "lambda" directory
      handler: 'lambda.handler',  // file is "lambda", function is "handler"
      layers: [lambdaLayer]
    });
  }
}
```
<br>

### Step6: Lets deploy
After completing the above steps run the following commands to deploy:
- `npm run build`
- `cdk deploy`

<br>

### Step7: Test Your Lambda
Now at last if every things done according to the steps above, just go to your lambda console and test you lambda.
[How to test a lambda function in aws console](https://www.youtube.com/watch?v=seaBeltaKhw&feature=youtu.be&t=310 "How to test a lambda function in aws console").
 
Your can also check the lambda layer in your aws console. Go to your **Code** tab scroll down and you can see the lambda layer.
![img](images/img1.JPG)
       
![img](images/img2.JPG)

