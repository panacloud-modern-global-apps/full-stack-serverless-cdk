import * as cdk from '@aws-cdk/core';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';

export class Example00CreateAutoSecretStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const role = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    const secret = new secretsmanager.Secret(this, 'Secret');  // SecretsManager generate a new secret value automatically
    secret.grantRead(role);

    const lambdaFn = new lambda.Function(this, `ExampleLambdaAssetFn`, {
      code: lambda.Code.fromInline('exports.handler = function(event, ctx, cb) { console.log("SECRET_KEY", process.env.EXAMPLE_SECRET_KEY); return cb(null, "hi"); }'),
      runtime: lambda.Runtime.NODEJS_12_X,
      role: role,
      environment: {
        EXAMPLE_SECRET_KEY: `${
          secretsmanager.Secret.fromSecretAttributes(this, "ExampleSecretKey", {
            // replace with actual ARN for the secret key
            secretArn: secret.secretArn,
          }).secretValue
        }`
      },
      handler: "index.handler",
    })

  }
}
