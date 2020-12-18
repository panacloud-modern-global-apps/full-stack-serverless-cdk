# AWS CDK CI/CD Pipeline

## Overview

In this step we are just setting up a cdk pipline source that will be a connection between our github and aws.

## step 1
Go to https://github.com/settings/tokens and create your Personal access token. Select complete scope of repo and click on Generate token to generate token.

## step 2
- Go to the AWS secret Manager Console and click on store a new secret.
- Select Secret type other type of secrets and select plaintext and paste the token in the input.
- Then add a secret name and it will be used in your cdk code.
- then save.

Note: For using code pipeline please create your own repo and setup it with your own github credentials with access token.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
