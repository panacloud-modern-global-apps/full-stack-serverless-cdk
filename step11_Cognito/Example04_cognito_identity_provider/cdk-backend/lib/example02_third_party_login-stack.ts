import * as cdk from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as origins from "@aws-cdk/aws-cloudfront-origins";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";

export class Example02ThirdPartyLoginStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new cognito.UserPool(this, "myuserpool", {
      
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: "Verify your email for our awesome app!",
        emailBody:
          "Hello {username}, Thanks for signing up to our awesome app! Your verification code is {####}",
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      signInAliases: {
        username: true,
        email: true,
      },
      autoVerify: { email: true },
      signInCaseSensitive: false,
      standardAttributes: {
        fullname: {
          required: true,
          mutable: true,
        },
        email:{
          required:true,
          mutable: false
        }
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
    });

  const client =   new cognito.UserPoolClient(this, 'app-client', {
      userPool: userPool,
      generateSecret: true,
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [ cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL ],
        callbackUrls: [ 'https://d3jucht95kbbhm.cloudfront.net/login/' ],
        logoutUrls: [ 'https://d3jucht95kbbhm.cloudfront.net' ],
      }
    
    });


    const domain = userPool.addDomain('CognitoDomain', {
      cognitoDomain: {
        domainPrefix: 'my-awesome-app',
      },
    });


    const signInUrl = domain.signInUrl(client, {
      redirectUri: 'https://d3jucht95kbbhm.cloudfront.net/login/', // must be a URL configured under 'callbackUrls' with the client
    })



 // create a bucket to upload your app files

 const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
  publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      websiteIndexDocument: "index.html",
});

// create a CDN to deploy your website

const distribution = new cloudfront.Distribution(this, "Distribution", {
  defaultBehavior: {
    origin: new origins.S3Origin(websiteBucket),
    cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,

  }});

// Prints out the web endpoint to the terminal

new cdk.CfnOutput(this, "DistributionDomainName", {
  value: distribution.domainName,
  
});

// housekeeping for uploading the data in bucket 

new s3deploy.BucketDeployment(this, "DeployWebsite", {
  sources: [s3deploy.Source.asset("../gatsby-frontend/public")],
  destinationBucket: websiteBucket,
  distribution,
  distributionPaths: ["/*"],
  retainOnDelete: false,
  prune: true,
});




  }
}
