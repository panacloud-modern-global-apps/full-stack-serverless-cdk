import * as cdk from '@aws-cdk/core';
import * as cognito from "@aws-cdk/aws-cognito";
import * as lambda from "@aws-cdk/aws-lambda";
import * as iam from "@aws-cdk/aws-iam";

export class Example01UserpoolWithLambdaTriggerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const role = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    const policy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['ses:*'],
      resources: ['*']
    })

    role.addToPolicy(policy);

    const authEmailFn = new lambda.Function(this, 'authEmailFn', {
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      role: role
    });

    const userPool = new cognito.UserPool(this, "UserPool", {
      selfSignUpEnabled: true, // Allow users to sign up
      autoVerify: { email: true }, // Verify email addresses by sending a verification code
      signInAliases: { email: true }, // Set email as an alias
      userVerification: {
        emailSubject: 'Verify your email for our awesome app!',
        emailBody: 'Hello {username}, Thanks for signing up to our awesome app! Your verification code is {####}',
        emailStyle: cognito.VerificationEmailStyle.CODE,
        smsMessage: 'Hello {username}, Thanks for signing up to our awesome app! Your verification code is {####}',
      },                                ///customize email and sms
      lambdaTriggers: {
        postConfirmation: authEmailFn  ///Trigger after user has been confirmed
      }
    });
  }
}
