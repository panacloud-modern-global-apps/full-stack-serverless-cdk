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


At the command line use the command, ***npm install -g typescript***


At the command line use the command, ***npm install -g cdk***


[Understand the key concepts: app, stacks, constructs, L1, L2, and L3 constructs](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html)

At the below Config command (aws configure), when prompted, **input:** * *AWS access key ID, secret access key, and default region (I selected us-east-2)* *.

Run Command: ***aws configure*** . //to configure the AWS config file [More information at this link](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)

[Build a Hello World App](https://docs.aws.amazon.com/cdk/latest/guide/hello_world.html)

Run the Command: ***mkdir step00_hello_cdk***  // to create a new directory for the "hello world app".

Run the Command: ***cd step00_hello_cdk*** // to make the "step00_hello_cdk" the current directory. 

Run the Command: ***cdk init app --language typescript*** // to initialize the app, specifying the desired template ("app") and the programming language.

Run the Command: ***cdk ls*** // to list the stacks in your app.

Run the Command: ***npm install @aws-cdk/aws-s3***  //to install the Amazon S3 package

Edit the file  lib/step00_hello_cdk-stack.ts  and add to it a s3 L2 construct(Bucket).

Run the command: ***npm run build***

Run the command: ***cdk synth***  // to create AWS CloudFormation template for the app.

Run the command:***cdk deploy*** // to deploy the stack using AWS CloudFormation

You can go to the AWS CloudFormation console and see that it now lists Step00HelloCdkStack:

https://console.aws.amazon.com/cloudformation/home

You'll also find MyFirstBucket (step00hellocdkstack-myfirstbucketb8884501-r3g3as4wff5f) in the Amazon S3 console (the last 12 digits would be different from the one listed here).

https://s3.console.aws.amazon.com/s3/home?region=us-east-2#


As per the [tutorial](https://docs.aws.amazon.com/cdk/latest/guide/hello_world.html#hello_world_tutorial_destroy) now modify the app and distroy it. **Ensure that the Buckets's RemovalPolicy has been changed to** * *removalPolicy: cdk.RemovalPolicy.DESTROY * *.





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
