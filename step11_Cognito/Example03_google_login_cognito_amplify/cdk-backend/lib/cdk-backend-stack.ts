import * as cdk from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";

export class CdkBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new cognito.UserPool(this, "eruGoogleUserPool", {
      selfSignUpEnabled: true,
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      userVerification: {
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
    });

    const provider = new cognito.UserPoolIdentityProviderGoogle(
      this,
      "googleProvider",
      {
        userPool: userPool,
        clientId:
          "xxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com", // Google Client id
        clientSecret: "xxxxxx123123xxxxxxxxxxxxxx", // Google Client Secret
        attributeMapping: {
          email: cognito.ProviderAttribute.GOOGLE_EMAIL,
          givenName: cognito.ProviderAttribute.GOOGLE_GIVEN_NAME,
          phoneNumber: cognito.ProviderAttribute.GOOGLE_PHONE_NUMBERS,
        },
        scopes: ["profile", "email", "openid"],
      }
    );
    userPool.registerIdentityProvider(provider);

    const userPoolClient = new cognito.UserPoolClient(this, "amplifyClient", {
      userPool,
      oAuth: {
        callbackUrls: ["http://localhost:8000/"], // This is what user is allowed to be redirected to with the code upon signin. this can be a list of urls.
        logoutUrls: ["http://localhost:8000/"], // This is what user is allowed to be redirected to after signout. this can be a list of urls.
      },
    });

    const domain = userPool.addDomain("domain", {
      cognitoDomain: {
        domainPrefix: "eru-test-pool", // SET YOUR OWN Domain PREFIX HERE
      },
    });

    new cdk.CfnOutput(this, "aws_user_pools_web_client_id", {
      value: userPoolClient.userPoolClientId,
    });
    new cdk.CfnOutput(this, "aws_project_region", {
      value: this.region,
    });
    new cdk.CfnOutput(this, "aws_user_pools_id", {
      value: userPool.userPoolId,
    });

    new cdk.CfnOutput(this, "domain", {
      value: domain.domainName,
    });
  }
}
