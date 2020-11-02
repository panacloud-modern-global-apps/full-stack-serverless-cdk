[AWS CDK in TypeScript](https://docs.aws.amazon.com/cdk/latest/guide/work-with-cdk-typescript.html)

[Signup for a AWS Fee Tier](https://aws.amazon.com/free/)

[Get and setup AWS Credentials](https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/aws-credentials.html)

[Create IAM User](https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started_create-admin-group.html)

[Installing the AWS SAM CLI - This is an AWS CLI tool that helps you develop, test, and analyze your serverless applications locally](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

[Install Docker to test apps locally](https://docs.docker.com/get-docker/)

[Install the Toolkit for VS Code](https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/setup-toolkit.html)


npm install -g typescript

npm install -g cdk

mkdir step00_hello_cdk

cd step00_hello_cdk

cdk init app --language typescript

npm install @aws-cdk/aws-s3 @aws-cdk/aws-lambda --save



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
