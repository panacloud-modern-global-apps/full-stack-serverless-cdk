# Code Explanation

## Created a User Pool

We created our user pool with some custom parameters. These parameters are quite self-explanatory but if you want to learn more about them [click here](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-cognito-readme.html)

```javascript

  const userPool = new cognito.UserPool(this, "userPool-Amplify", {
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
        phoneNumber: {
          required:true,
          mutable: true
        }
        
      },
    })

```

## Created an App Client

An app is an entity within a user pool that has permission to call unauthenticated APIs (APIs that do not have an authenticated user), such as APIs to register, sign in, and handle forgotten passwords. To call these APIs, you need an app client ID and an optional client secret. Read [Configuring a User Pool App Client](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html) to learn more.

Basically the client allows our front-end to communicate with our user pool.

We have referenced our user pool in the client.

```javascript

  const userPoolClient = new cognito.UserPoolClient(this, "userPoolClient-Amplify", {
      userPool,
    })

```


## print our user pool id and client id on the console

The following code just print the ids. We would be needing them in our front end to connect to our user pool.

```javascript

new cdk.CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId,
    })

    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: userPoolClient.userPoolClientId,
    })

```

