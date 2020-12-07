[What is AWS CDK?](https://serverless-stack.com/chapters/what-is-aws-cdk.html)

[AWS CDK in TypeScript](https://docs.aws.amazon.com/cdk/latest/guide/work-with-cdk-typescript.html)

[AWS CDK and Typescript: Deploy a static React app to S3](https://medium.com/swlh/aws-cdk-and-typescript-deploy-a-static-react-app-to-s3-df74193e9e3d)

[Signup for a AWS Fee Tier](https://aws.amazon.com/free/)

[Get and setup AWS Credentials](https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/aws-credentials.html)

[Create IAM User](https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started_create-admin-group.html)

[Install TypeScript](https://www.npmjs.com/package/typescript)

[Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)

[Installing the AWS SAM CLI - This is an AWS CLI tool that helps you develop, test, and analyze your serverless applications locally](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

[Install AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/work-with-cdk-typescript.html)

[Install Docker to test apps locally](https://docs.docker.com/get-docker/)

[Install the Toolkit for VS Code](https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/setup-toolkit.html)


npm install -g typescript

npm install -g aws-cdk


[Understand the key concepts: app, stacks, constructs, L1, L2, and L3 constructs](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html)

Config command: AWS access key ID, secret access key, and default region (I selected us-east-2) when prompted

aws configure

[Build a Hello World App](https://docs.aws.amazon.com/cdk/latest/guide/hello_world.html)

mkdir step00_hello_cdk

cd step00_hello_cdk

cdk init app --language typescript

cdk ls

npm install @aws-cdk/aws-s3

Edit lib/step00_hello_cdk-stack.ts and add s3 L2 construct

npm run build

cdk synth

cdk deploy

You can go to the AWS CloudFormation console and see that it now lists Step00HelloCdkStack:

https://console.aws.amazon.com/cloudformation/home

You'll also find MyFirstBucket (step00hellocdkstack-myfirstbucketb8884501-r3g3as4wff5f) in the Amazon S3 console.

https://s3.console.aws.amazon.com/s3/home?region=us-east-2#


As per the tutorial now modify the app and distroy it

[Step 00 Class Video in English on Facebook](https://www.facebook.com/zeeshanhanif/videos/10225191381716499)

[Step 00 Class Video in English on YouTube](https://www.youtube.com/watch?v=UpuVx8c0-lA)

[Step 00 Class Video in Urdu on Facebook](https://www.facebook.com/zeeshanhanif/videos/10225203759985948)

[Step 00 Class Video in Urdu on YouTube](https://www.youtube.com/watch?v=xWF-LCTnSy4)






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
