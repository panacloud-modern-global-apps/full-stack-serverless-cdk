import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import * as iam from "@aws-cdk/aws-iam";
import * as s3 from "@aws-cdk/aws-s3";

export class Example04UserpoolWithIdentityPoolStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // const bucket = new s3.Bucket(this, "new_bucket", {
    //   bucketName: "upload-bucket"
    // })

    const bucket = new s3.Bucket(this, "Uploads", {
      cors: [
        {
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST, s3.HttpMethods.DELETE, s3.HttpMethods.HEAD],
        },
      ],
    });

    const userPool = new cognito.UserPool(this, 'chat-app-user-pool', {
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
      allowUnauthenticatedIdentities: false, // Don't allow unathenticated users
      cognitoIdentityProviders: [
        {
          clientId: userPoolClient.userPoolClientId,
          providerName: userPool.userPoolProviderName,
        },
      ],
    });

    const role = new iam.Role(this, "CognitoDefaultAuthenticatedRole", {
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

    ///Attach particular role to identity pool
    role.addToPolicy(
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
    
    ///Attach particular role to identity pool
    new cognito.CfnIdentityPoolRoleAttachment(
        this,
        "IdentityPoolRoleAttachment",
        {
          identityPoolId: identityPool.ref,
          roles: { authenticated: role.roleArn },
        }
    );

    role.addToPolicy(
      // IAM policy granting users permission to a specific folder in the S3 bucket
      new iam.PolicyStatement({
        actions: ["s3:*"],
        effect: iam.Effect.ALLOW,
        resources: [
          bucket.bucketArn + "/private/${cognito-identity.amazonaws.com:sub}/*",
        ],
      })
    );

    
    new cdk.CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId
    });

    new cdk.CfnOutput(this, "IdentityPoolId", {
      value: identityPool.ref,
    });
    
    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: userPoolClient.userPoolClientId
    });

    new cdk.CfnOutput(this, "userPoolProviderName", {
      value: userPool.userPoolProviderName
    });

    new cdk.CfnOutput(this, "Ref", {
      value: identityPool.ref
    });

    new cdk.CfnOutput(this, "bucketName", {
      value: bucket.bucketName
    });


  }
}
