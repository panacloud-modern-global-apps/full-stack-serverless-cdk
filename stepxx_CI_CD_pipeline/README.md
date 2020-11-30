# AWS CDK CI/CD Pipeline

## Why Code Pipeline?
AWS CodePipeline is a fully managed continuous delivery service that helps you automate your release pipelines for fast and reliable application and infrastructure updates. CodePipeline automates the build, test, and deploy phases of your release process every time there is a code change, based on the release model you define. This enables you to rapidly and reliably deliver features and updates. You can easily integrate AWS CodePipeline with third-party services such as GitHub or with your own custom plugin. With AWS CodePipeline, you only pay for what you use. There are no upfront fees or long-term commitments.

## Pipeline
A pipeline is a workflow construct that describes how software changes go through a release process. Each pipeline is made up of a series of stages.

## Stages
A stage is a logical unit you can use to isolate an environment and to limit the number of concurrent changes in that environment. A stage might be a build stage, where the source code is built and tests are run. It can also be a deployment stage, where code is deployed to runtime environments. Each stage is made up of a series of serial or parallel actions.

## Actions
An action is a set of operations performed on application code and configured so that the actions run in the pipeline at a specified point. 

## Artifacts
Artifacts refers to the collection of data, such as application source code, built applications, dependencies, definitions files, templates, and so on, that is worked on by pipeline actions. Artifacts are produced by some actions and consumed by others. In a pipeline, artifacts can be the set of files worked on by an action (input artifacts) or the updated output of a completed action (output artifacts).

[Reference to CodePipeline](https://docs.aws.amazon.com/codepipeline/latest/userguide/concepts.html#concepts-stages)

# Code Build
AWS CodeBuild is a fully managed continuous integration service that compiles source code, runs tests, and produces software packages that are ready to deploy. With CodeBuild, you don’t need to provision, manage, and scale your own build servers. CodeBuild scales continuously and processes multiple builds concurrently, so your builds are not left waiting in a queue. You can get started quickly by using prepackaged build environments, or you can create custom build environments that use your own build tools. With CodeBuild, you are charged by the minute for the compute resources you use.

[Code build with Code Pipeline](https://www.1strategy.com/blog/2019/10/09/building-a-ci-cd-pipeline-for-serverless-applications-on-aws-with-aws-cdk/)

[Deploy react app with codebuild codepipeline](https://sbstjn.com/blog/deploy-react-cra-with-cdk-codepipeline-and-codebuild)

[Building CICD pipelines for serverless microservices using the AWS CDK](https://serverlessfirst.com/serverless-cicd-pipelines-with-aws-cdk/)


## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
