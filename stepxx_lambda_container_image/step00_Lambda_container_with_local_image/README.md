# Lambda container with local image

## Introduction

With AWS Lambda, you upload your code and run it without thinking about servers. Many customers enjoy the way this works, but if you’ve invested in container tooling for your development workflows, it’s not easy to use the same approach to build applications using Lambda.

To help you with that, you can now package and deploy Lambda functions as container images of up to 10 GB in size. In this way, you can also easily build and deploy larger workloads that rely on sizable dependencies, such as machine learning or data intensive workloads. Just like functions packaged as ZIP archives, functions deployed as container images benefit from the same operational simplicity, automatic scaling, high availability, and native integrations with many services.

## Article

we will follow this [Article](https://aws.amazon.com/blogs/aws/new-for-aws-lambda-container-image-support/) to create lambda container image in this step we will only Lambda container with local image

## Step 1

- Create a [new cdk project](https://github.com/panacloud-modern-global-apps/full-stack-serverless-cdk/tree/main/step00_hello_cdk) make a folder **lambdaImage** in it.
- Create a new file (app.ts) in **lambdaImage** folder

## Step 2

Here’s the code (app.ts) for a simple Node.js Lambda function generating a random word Each time it is invoked

```typescript
import { APIGatewayProxyEvent } from "aws-lambda";
const randomWords = require("random-words");

exports.handler = async (event: APIGatewayProxyEvent) => {
  // Generating random word
  const myWord = randomWords();
  return myWord;
};
```

I use npm to initialize the package and add the two dependencies I need in the package.json file. In this way, I also create the package-lock.json file. I am going to add it to the container image to have a more predictable result.

```bash
npm install @types/aws-lambda
npm install random-words
```

Since we are using typescript, run the command **npm run build**(from the root directory) so your application is converted to JavaScript using the TypeScript compiler. The resulting JavaScript code is then executed.

## Step 3

Now, I create a Dockerfile to create the container image for my Lambda function, starting from the AWS provided base image for the nodejs12.x runtime. All AWS provided base images are available in Docker Hub and ECR Public. In this case, I am using the base image hosted in ECR Public.

```Dockerfile
#Adding base image
FROM public.ecr.aws/lambda/nodejs:12
# Alternatively, you can pull the base image from Docker Hub: amazon/aws-lambda-nodejs:12

COPY app.js package*.json /var/task/

# Install NPM dependencies for function
RUN npm install

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "app.handler" ]
```

To use the image in Docker Hub, I can replace the first line with

```Dockerfile
FROM amazon/aws-lambda-nodejs:12
```

The Dockerfile is adding the source code (app.js) and the files describing the package and the dependencies (package.json and package-lock.json) to the base image. Then, run npm to install the dependencies. I set the CMD to the function handler.

## Step 4

I use the [Docker CLI](https://docs.docker.com/engine/reference/commandline/cli/) to build the random-letter container image locally

```bash
$ docker build -t random-word.
```

## Step 5

To check if this is working, we have to start the container image locally using the Lambda [Runtime Interface Emulator (RIE)](https://docs.aws.amazon.com/lambda/latest/dg/images-test.html). RIE is already included in AWS base image so we don't need to install it.

```bash
$ docker run -p 9000:8080 random-word:latest
```

This command runs the image as a container and starts up an endpoint locally at `localhost:9000/2015-03-31/functions/function/invocations`. this endpoint is provided by [RIE](https://docs.aws.amazon.com/lambda/latest/dg/images-test.html).

## Step 6

[Install curl](https://www.cyberciti.biz/faq/how-to-install-curl-command-on-a-ubuntu-linux/) on your system. Post an event to the following endpoint using a curl command.

```bash
$ curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{}'
```

If there are errors, We can fix them locally. When it works, We move to the next step.

## Step 7

Our lambda is created successfully now We have to deploy it on cloudformation using cdk. for that We have to make a construct of lambda in our stack

```typescript
// creating lambda with contianer image
const fn = new lambda.DockerImageFunction(this, "lambdaFunction", {
  //make sure the lambdaImage folder must container Dockerfile
  code: lambda.DockerImageCode.fromImageAsset("lambdaImage"),
});
```

## Step 8

Authenticate the Docker CLI to your Amazon ECR registry.

```bash
aws ecr get-login-password --region "us-east-1" | docker login --username AWS --password-stdin "123456789012".dkr.ecr."us-east-1".amazonaws.com
```

Change only highlighted fields i.e `region` and `account number` also *remove the double quotes* from the command

## Step 9

Now build the project and deploy it by using command `cdk deploy` then what will happen is

- It will first find the Dockerfile from the directory which is provided in lambda function in our case it is `lambdaImage`
- Then it will build the image and deploy it on AWS ecr (by default it will make a private repo)
- and then the uploaded image will be use by our lambda function

Also check [Amazon Elastic Container Registry pricing](https://aws.amazon.com/ecr/pricing/)
