# AWS CDK CI/CD Pipeline

## Overviews

## step 1
Go to https://github.com/settings/tokens and create your Personal access token. Select complete scope of repo and click on Generate token to generate token.

## step 2
- Go to the AWS secret Manager Console and click on store a new secret.
- Select Secret type other type of secrets and select plaintext and paste the token in the input.
- Then add a secret name and it will be used in your cdk code.
- then save.

## Code Description

In this code snippet we are describing the codebuild template which steps to perform.
dist folder will be created as an output in which we have template file that will be used to update our stack.
please refer the correct path to the cdk init folder where lib folder exists from your repo root directory.

```javascript
        const s3Build = new CodeBuild.PipelineProject(this, 's3Build', {
          buildSpec: CodeBuild.BuildSpec.fromObject({
            version: '0.2',
            phases: {
              install: {
                "runtime-versions": {
                  "nodejs": 12
                },
                commands: [
                  'cd stepxx_CI_CD_pipeline_update_frontend',
                  'cd frontend',
                  'npm i -g gatsby',
                  'npm install',
                ],
              },
              build: {
                commands: [
                  'gatsby build',
                ],
              },
            },
            artifacts: {
              'base-directory': './stepxx_CI_CD_pipeline_update_frontend/frontend/public',   ///outputting our generated Gatsby Build files to the public directory
              "files": [
                '**/*'
              ]
            },
          }),
          environment: {
            buildImage: CodeBuild.LinuxBuildImage.STANDARD_3_0,   ///BuildImage version 3 because we are using nodejs environment 12
          },
        });
```

## How pipeline is working?

We have three stages in pipeline
- Source Stage: This stage is used for connection between the repo and AWS pipeline
- Build Stage: This stage where code pipeline get your code and start installing dependencies and setup your code.
- Deploy Stage: the output from build stage is then deployed in this stage.

Note: For using code pipeline please create your own repo and setup it with your own github credentials with access token.

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
