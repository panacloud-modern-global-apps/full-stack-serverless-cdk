What is a CDK construct?

[Constructs](https://docs.aws.amazon.com/cdk/latest/guide/constructs.html) are the basic building blocks of AWS CDK apps. A construct can represent a single resource, such as an Amazon Simple Storage Service (Amazon S3) bucket, or it can represent a higher-level component consisting of multiple AWS resources.

[Study AWS CDK Workshop: Writing Constructs Tutorial](https://cdkworkshop.com/20-typescript/40-hit-counter.html)

mkdir step01_hello_lambda

cdk init app --language typescript

npm install @aws-cdk/aws-lambda

Add lib/hitcounter.ts as per the turorial

npm run watch






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
