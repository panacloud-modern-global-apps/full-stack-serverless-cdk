# Welcome to your CDK TypeScript project!

To deploy this stack install all the dependencies by running `npm install`. For deployment run `npm run build` and `cdk deploy --parameters emailParam=<your email address> --parameters phoneNoParam=<your phone number>`.

After deployment you will get `Graphql_Endpoint`, `UserPoolId` and `UserPoolClientId` in your CLI, which will be required for our [frontend](../frontend) application.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
