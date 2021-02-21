# Lambda container with ecr image

## Introduction

With AWS Lambda, you upload your code and run it without thinking about servers. Many customers enjoy the way this works, but if you’ve invested in container tooling for your development workflows, it’s not easy to use the same approach to build applications using Lambda.

To help you with that, you can now package and deploy Lambda functions as container images of up to 10 GB in size. In this way, you can also easily build and deploy larger workloads that rely on sizable dependencies, such as machine learning or data intensive workloads. Just like functions packaged as ZIP archives, functions deployed as container images benefit from the same operational simplicity, automatic scaling, high availability, and native integrations with many services.

## Step 1

- Create a [new cdk project](https://github.com/panacloud-modern-global-apps/full-stack-serverless-cdk/tree/main/step00_hello_cdk) make a folder **ecr-lambda** in it.
- Create a new file (app.ts) in **ecr-lambda** folder

## Step 2

Here’s the code (app.js) for a simple Node.js Lambda function generating a random name Each time it is invoked

```typescript
const faker = require('faker');

exports.lambdaHandler = async (event) => {
  const randomName = faker.name.findName();
  console.log(randomName);

  const response = {
    statusCode: 200,
    body: randomName,
  };
  return response;
};
```

## Step 3

Now, I create a Dockerfile to create the container image for my Lambda function, starting from the AWS provided base image for the nodejs12.x runtime. All AWS provided base images are available in Docker Hub and ECR Public. In this case, I am using the base image hosted in ECR Public.

```Dockerfile
#Adding base image
FROM amazon/aws-lambda-nodejs:12
# Alternatively, you can pull the base image from Docker Hub: amazon/aws-lambda-nodejs:12

COPY app.js package*.json ./

# Install NPM dependencies for function
RUN npm install

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "app.lambdaHandler" ]
```

To use the image in ECR , I can replace the first line with

```Dockerfile
FROM public.ecr.aws/lambda/nodejs:12
```

The Dockerfile is adding the source code (app.js) and the files describing the package and the dependencies (package.json and package-lock.json) to the base image. Then, run npm to install the dependencies. I set the CMD to the function handler.

## Step 4 pushing image to ECR

```typescript
import { DockerImageAsset } from '@aws-cdk/aws-ecr-assets';
const asset = new DockerImageAsset(this, 'EcrImage', {
  directory: 'ecr-lambda',
});
```

In directory we give the name of our image folder which is 'ecr-lambda' here to push the image to the ECR , so we then pull out the image from ecr and use to make our container lambda.

## Step 5 pulling image from ECR

```typescript
import * as lambda from '@aws-cdk/aws-lambda';
//Lambda from ecr image
const ecrLambda = new lambda.DockerImageFunction(this, 'LambdaFunctionECR', {
  code: lambda.DockerImageCode.fromEcr(asset.repository, {
    tag: '<Tag of the image>',
  }),
});
```

required repository name is given as asset.repository and in props , the tag is the tag of image in repository of ECR.

## Step 6

Authenticate the Docker CLI to your Amazon ECR registry.

```bash
aws ecr get-login-password --region "us-east-1" | docker login --username AWS --password-stdin "123456789012".dkr.ecr."us-east-1".amazonaws.com
```

Change only highlighted fields i.e `region` and `account number` also _remove the double quotes_ from the command

## Step 7

Now build the project and deploy it by using command `cdk deploy` then what will happen is

- It will first find the Dockerfile from the directory which is provided in lambda function in our case it is `ecr-lambda`.
- Then it will build the image and deploy it on AWS ecr (by default it will make a private repo)
- and then the uploaded image will be use by our lambda function.

Also check [Amazon Elastic Container Registry pricing](https://aws.amazon.com/ecr/pricing/)

# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
