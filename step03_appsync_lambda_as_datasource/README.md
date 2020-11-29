# Integrate AppSync with Lambda as a Datasource

## Why AppSync?
Organizations choose to build APIs with GraphQL because it helps them develop applications faster, by giving front-end developers the ability to query multiple databases, microservices, and APIs with a single GraphQL endpoint.

AWS AppSync is a fully managed service that makes it easy to develop GraphQL APIs by handling the heavy lifting of securely connecting to data sources like AWS DynamoDB, Lambda, and more. Adding caches to improve performance, subscriptions to support real-time updates, and client-side data stores that keep off-line clients in sync are just as easy. Once deployed, AWS AppSync automatically scales your GraphQL API execution engine up and down to meet API request volumes.

## DataSource As Lambda
In this project we have used Lambda as a datasource which means our resolver will interact with lambda function for data operations.


[Building Real-time Serverless APIs with PostgreSQL, CDK, TypeScript, and AWS AppSync](https://aws.amazon.com/blogs/mobile/building-real-time-serverless-apis-with-postgres-cdk-typescript-and-aws-appsync/)


mkdir step03_appsync_lambda_as_datasource

cdk init app --language typescript

yarn add @aws-cdk/aws-lambda
yarn add @aws-cdk/aws-appsync

Installing Bootstrap Stack

cdk bootstrap

Start building on every change

npm run watch

OR

build one time

npm run build

Write a Lambada function in lambda/index.js

cdk deploy

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
