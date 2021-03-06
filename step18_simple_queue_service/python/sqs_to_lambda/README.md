
# Steps to compile the code

## Step 01

Our cdk code remains in typescript. We will not change it to python. Read the reference article for better understanding.

Reference article:
[Which programming language is best for CDK ](https://awsmaniac.com/which-programming-language-is-the-best-for-aws-cdk/)

## Step 02

Change Runtime from NODEJS TO PYTHON in lambda function in your stack file under lib folder as we are writing our handler in python.

```javascript
const sqsLambda = new lambda.Function(this, "sqsLambda", {
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.fromAsset("lambda"),
      handler: "index.handler",
      reservedConcurrentExecutions: 5,
    });
```


## Step 03

Create a file lambda/index.py and add handler code for your lambda function

```javascript
from __future__ import print_function


def handler(event, context):
    for record in event['Records']:
        message = record['body']
        print(str(message))
        return message
        
```

## Step 04
Installing Bootstrap Stack. 
For Lambda functions we will need to do [bootstrapping](https://docs.aws.amazon.com/cdk/latest/guide/bootstrapping.html) becuase they require [assets](https://docs.aws.amazon.com/cdk/latest/guide/assets.html) i.e. handler code that will be bundleded with the CDK library etc. and stored in S3 bootstraped bucket:

```javascript
cdk bootstrap
```


## Step 05 (optional)

Run the following command to see the cloud formation template of your cdk code.

```javascript
cdk synth
```

## Step 06 (optional)

Run the following command to see the difference between the new changes that you just made and the code that has already been deployed on the cloud.
```javascript
cdk diff
```


## Step 07

Run the following command to deploy your code to the cloud. 

```javascript
cdk deploy
```

if you did not run "npm run watch" in the step 4 then you need to build the project before deployment by running the folliwng command. npm run build will also compile typescript files of the lambda function

```javascript
npm run build && cdk deploy
OR
yarn build && cdk deploy
```

