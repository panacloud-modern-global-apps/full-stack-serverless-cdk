# Steps to compile the code

## Step 01

Our cdk code remains in typescript. We will not change it to python. Read the reference article for better understanding.

Reference article:
[Which programming language is best for CDK ](https://awsmaniac.com/which-programming-language-is-the-best-for-aws-cdk/)

## Step 02

Change Runtinme from NODEJS TO PYTHON in lambda function in your stack file under lib folder as we are writing our handler in python.

```
const hello = new lambda.Function(this, "HelloHandler", {
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.fromAsset("pythonLambda"),
      handler: "index.handler",
    });
```


## Step 03

Create a file pythonLambda/index.py and add handler code for your lambda function

```
def handler(event, context):
    print(event)

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "text/plain"
        },
        "body": f"Hello, You've hit the path {event['path']}."
    }
```

## Step 04
Installing Bootstrap Stack. 
For Lambda functions we will need to do [bootstrapping](https://docs.aws.amazon.com/cdk/latest/guide/bootstrapping.html) becuase they require [assets](https://docs.aws.amazon.com/cdk/latest/guide/assets.html) i.e. handler code that will be bundleded with the CDK library etc. and stored in S3 bootstraped bucket:

```
cdk bootstrap
```


## Step 05 (optional)

Run the following command to see the cloud formation template of your cdk code.

```
cdk synth
```

## Step 06 (optional)

Run the following command to see the difference between the new changes that you just made and the code that has already been deployed on the cloud.
```
cdk diff
```


## Step 07

Run the following command to deploy your code to the cloud. 

```
cdk deploy
```

if you did not run "npm run watch" in the step 4 then you need to build the project before deployment by running the folliwng command. npm run build will also compile typescript files of the lambda function

```
npm run build && cdk deploy
OR
yarn build && cdk deploy
```


TypeScript was the first language supported for developing AWS CDK applications as CDK infrastructure is built in Typescript, and there is a substantial amount of example CDK code written in TypeScript. We have kept  CDK code in Typescript and changed the rest into Python, mainly lambda functions.


# Type pitfalls

Python uses dynamic typing, where variables may refer to a value of any type. Parameters and return values may be annotated with types, but these are "hints" and are not enforced. This means that in Python, it is easy to pass the incorrect type of value to a AWS CDK construct. Instead of getting a type error during build, as you would from a statically-typed language, you may instead get a runtime error when the JSII layer (which translates between Python and the AWS CDK's TypeScript core) is unable to deal with the unexpected type.

# Using interfaces

Python doesn't have an interface feature as some other languages do, though it does have abstract base classes, which are similar. TypeScript, the language in which the AWS CDK is implemented, does provide interfaces, and constructs and other AWS CDK objects often require an object that adheres to a particular interface, rather than inheriting from a particular class. So the AWS CDK provides its own interface feature as part of the JSII layer.

# [Building Lambda functions with Python](https://docs.aws.amazon.com/lambda/latest/dg/lambda-python.html)

# [AWS Lambda function handler in Python](https://docs.aws.amazon.com/lambda/latest/dg/python-handler.html)

# Boto3

## We will also use boto3 in some of our lambda functions

Boto is the Amazon Web Services (AWS) SDK for Python. It enables Python developers to create, configure, and manage AWS services, such as EC2 and S3. Boto provides an easy to use, object-oriented API, as well as low-level access to AWS services.

## For more information about boto3 check out this [documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)

[Boto3 Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)

# AWS CDK in Python

If you wish to work with CDK in Python:

[Working with Python in CDK](https://docs.aws.amazon.com/cdk/latest/guide/work-with-cdk-python.html)
[AWS CDK idioms in Python](https://docs.aws.amazon.com/cdk/latest/guide/work-with-cdk-python.html)


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
