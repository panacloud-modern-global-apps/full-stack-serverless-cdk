import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import * as iam from "@aws-cdk/aws-iam";
import * as s3 from "@aws-cdk/aws-s3";
import { WebIdentityPrincipal } from '@aws-cdk/aws-iam';
import { BlockPublicAccess } from '@aws-cdk/aws-s3';

export class Example04UserpoolWithIdentityPoolStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "Uploads", {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL, //block all public access to bucket, as we only want logged in cognito users from our gatsby frontend, to be able to access (upload files) to this bucket
      cors: [
        {
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST, s3.HttpMethods.DELETE, s3.HttpMethods.HEAD],
        },
      ],
    });

    const userPool = new cognito.UserPool(this, 'upload-app-user-pool', {
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

    //create an identity pool with CognitoIdentityProvider i.e. an identity pool corresponding to the above user pool and its app client
    const identityPool = new cognito.CfnIdentityPool(this, "IdentityPool", {
      allowUnauthenticatedIdentities: false, // Don't allow unathenticated users
      cognitoIdentityProviders: [
        {
          clientId: userPoolClient.userPoolClientId,
          providerName: userPool.userPoolProviderName,
        },
      ],
    });

    // Create a role of type WebIdentityPrinicipal (the third option on the Create Role Screen in AWS Console) 
    // to allow users federated by the specified provider (cognito identity provider in our case as defined above ) 
    // to assume this role to perform actions in your account.
    const role = new iam.Role(this, "CognitoDefaultAuthenticatedRole", {
      assumedBy: new WebIdentityPrincipal('cognito-identity.amazonaws.com'),
    
    });
    
    ///Attach role to identity pool AND only for authenticated users (users that will sign in from the frontend) 
    new cognito.CfnIdentityPoolRoleAttachment(
        this,
        "IdentityPoolRoleAttachment",
        {
          identityPoolId: identityPool.ref,
          roles: { authenticated: role.roleArn },
        }
    );

    role.addToPolicy(
      // IAM policy granting users permission to have access to S3 bucket
      // We specify the bucket in the resources as well so that the role only has permission to this specific bucket, not all the buckets 
      new iam.PolicyStatement({
        actions: ["s3:*"],
        effect: iam.Effect.ALLOW,
        resources: [
          bucket.bucketArn + "/*",
          // Incase we want to give permssion to upload to a user-specific folder we can define the resource as follows
          // where cognito-identity.amazonaws.com:sub value is the identity ID for the individual user, not the identifier of their login account (such as an email address):
          // bucket.bucketArn + "/users/${cognito-identity.amazonaws.com:sub}/*",
          
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

    new cdk.CfnOutput(this, "bucketName", {
      value: bucket.bucketName
    });


  }
}
