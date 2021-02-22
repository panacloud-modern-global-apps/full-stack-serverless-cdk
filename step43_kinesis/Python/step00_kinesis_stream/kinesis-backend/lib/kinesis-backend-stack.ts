import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as kinesis from '@aws-cdk/aws-kinesis';
import  { KinesisEventSource } from '@aws-cdk/aws-lambda-event-sources';
import * as cognito from '@aws-cdk/aws-cognito';
import * as iam from "@aws-cdk/aws-iam";

export class KinesisBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const stream = new kinesis.Stream(this, "MyFirstStream", {
      streamName: "my-first-stream",
      shardCount: 1,      
    });


    const userPool = new cognito.UserPool(this, 'kinesis-app-user-pool', {
      selfSignUpEnabled: true,
      accountRecovery: cognito.AccountRecovery.PHONE_AND_EMAIL,
      signInAliases: {
        email: true
      },
      userVerification: {
        emailStyle: cognito.VerificationEmailStyle.CODE
      },
      autoVerify: {
        email: true
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true
        }
      }
    });

    const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool
    });

    const identityPool = new cognito.CfnIdentityPool(this, "IdentityPool", {
      allowUnauthenticatedIdentities: true, // Don't allow unathenticated users
      cognitoIdentityProviders: [
        {
          clientId: userPoolClient.userPoolClientId,
          providerName: userPool.userPoolProviderName,
        },
      ],
    });

    const authenticatedRole = new iam.Role(this, "CognitoDefaultAuthenticatedRole", {
      assumedBy: new iam.FederatedPrincipal(
        "cognito-identity.amazonaws.com",
        {
          StringEquals: {
            "cognito-identity.amazonaws.com:aud": identityPool.ref,
          },
          "ForAnyValue:StringLike": {
            "cognito-identity.amazonaws.com:amr": "authenticated",
          },
        },
        "sts:AssumeRoleWithWebIdentity"
      ),
    });

    const unauthenticatedRole = new iam.Role(this, 'CognitoDefaultUnauthenticatedRole', {
      assumedBy: new iam.FederatedPrincipal('cognito-identity.amazonaws.com', {
          "StringEquals": { "cognito-identity.amazonaws.com:aud": identityPool.ref },
          "ForAnyValue:StringLike": { "cognito-identity.amazonaws.com:amr": "unauthenticated" },
      }, "sts:AssumeRoleWithWebIdentity"),
  });

    //Attach particular role to identity pool
    authenticatedRole.addToPolicy(
        new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "mobileanalytics:PutEvents",
              "cognito-sync:*",
              "cognito-identity:*",
            ],
            resources: ["*"],
        })
    );
    
       
    unauthenticatedRole.addToPolicy(
      new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
          "mobileanalytics:PutEvents",
          "cognito-sync:*",
          "cognito-identity:*",
      ],
      resources: ["*"],
  }));


  //Attach particular role to identity pool
  new cognito.CfnIdentityPoolRoleAttachment(
    this,
    "IdentityPoolRoleAttachment",
    {
      identityPoolId: identityPool.ref,
      roles: { 
        authenticated: authenticatedRole.roleArn,
        unauthenticated: unauthenticatedRole.roleArn, 
      },
    }
  );

    const myFunction = new lambda.Function(this, "func", {
      runtime: lambda.Runtime.PYTHON_3_7,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
    });

         
    //Update Lambda Permissions To Use Stream
    stream.grantReadWrite(unauthenticatedRole)
    stream.grantReadWrite(authenticatedRole)
    stream.grantRead(myFunction)    
    
    myFunction.addEventSource(new KinesisEventSource(stream, {
      batchSize: 100, // default
      startingPosition: lambda.StartingPosition.TRIM_HORIZON
    }));
    
      new cdk.CfnOutput(this, "IdentityPoolId", {
      value: identityPool.ref,
    });
         
    new cdk.CfnOutput(this, "StreamName", {
      value: stream.streamName || "",
    });
    
  }
}
