import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import * as path from 'path';

export class Example01RotateSecretWithLambdaStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const secret = new secretsmanager.Secret(this, 'Secret', {
      description: "My Secret",
      secretName: 'example-secret',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: "SecretKey",
      }
    });

    ///This will rotate after every 24 hours
    const lambdaFunc = new lambda.Function(this, 'LambdaSecretRotate', {
      functionName: 'lambda-keys-rotate',
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        REGION: cdk.Stack.of(this).region,
        SECRET_NAME: "example-secret",
        KEY_IN_SECRET_NAME: "SecretKey"
      }
    })

    secret.addRotationSchedule('RotationSchedule', {
      rotationLambda: lambdaFunc,
      automaticallyAfter: cdk.Duration.hours(24)
    });

    secret.grantRead(lambdaFunc);

    lambdaFunc.grantInvoke(new iam.ServicePrincipal('secretsmanager.amazonaws.com'))

    lambdaFunc.addToRolePolicy(new iam.PolicyStatement({
      resources: [secret.secretArn],
      actions: ['secretsmanager:PutSecretValue']
    }));

  }
}
