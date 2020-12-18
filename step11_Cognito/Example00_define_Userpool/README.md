# Cognito User pool

A user pool is a user directory in Amazon Cognito. With a user pool, your users can sign in to your web or mobile app through Amazon Cognito. Your users can also sign in through social identity providers like Google, Facebook, Amazon, or Apple, and through SAML identity providers. Whether your users sign in directly or through a third party, all members of the user pool have a directory profile that you can access through a Software Development Kit (SDK).

### User pools provide:

- Sign-up and sign-in services.

- A built-in, customizable web UI to sign in users.

- Social sign-in with Facebook, Google, Login with Amazon, and Sign in with Apple, as well as sign-in with SAML identity providers from your user pool.

- User directory management and user profiles.

- Security features such as multi-factor authentication (MFA), checks for compromised credentials, account takeover protection, and phone and email verification.

- Customized workflows and user migration through AWS Lambda triggers.

[Coginto CDK](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-cognito-readme.html)

[User Pool CDK Contructs](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-cognito.UserPool.html)

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
