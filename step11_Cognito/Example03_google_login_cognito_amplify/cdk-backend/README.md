# Adding Google Signin to Cognito

## Dependencies

```
npm i @aws-cdk/aws-cognito
```

## Quick-Start

1. Set domains in google dev console.
2. Copy client id, client secret, domain prefix to cdk.
3. cdk deploy, copy the outputs to frontend. **Note: the redirect urls that you specify in the frontend MUST BE INCLUDED in the list of allowed urls that you specified in the backend userpool client oAuth object.**
4. `gatsby develop`

## Sources

- [Google Developer Console](https://console.developers.google.com/)
- [AWS Cognito Docs for third party IdP](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-social-idp.html)
- [AWS CDK Docs for Third Party Providers](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-cognito-readme.html#identity-providers)
- [AWS CDK API for Google Provider](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-cognito.UserPoolIdentityProviderGoogle.html)
- [AWS Amplify docs for Social Signing](https://docs.amplify.aws/lib/auth/social/q/platform/js)
- [AWS Amplify docs for List of Auth Events for Hub](https://docs.amplify.aws/lib/auth/auth-events/q/platform/js)

## Introduction

Cognito also allows us to use third party providers to sign in to our application. This is done by requesting user information from the respective providers like Google, Amazon or Facebook and then mapping them to new users in our cognito user pool.

We create a user pool as usual and then to that userpool we will now be adding a third party provider, Google in this case:

```typescript
const provider = new cognito.UserPoolIdentityProviderGoogle(
  this,
  "googleProvider",
  {
    userPool: userPool,
    clientId: "ENTER_THE_GOOGLE_CLIENT_ID",
    clientSecret: "ENTER_THE_GOOGLE_CLIENT_SECRET",
    attributeMapping: {
      email: cognito.ProviderAttribute.GOOGLE_EMAIL,
      givenName: cognito.ProviderAttribute.GOOGLE_GIVEN_NAME,
      phoneNumber: cognito.ProviderAttribute.GOOGLE_PHONE_NUMBERS,
    },
    scopes: ["profile", "email", "openid"],
  }
);
userPool.registerIdentityProvider(provider);
```

We see that it requires a client Id and client secret. These values will be received from the **google developer console** after creating Auth Credentials. When creating the credentials we will also need to provide the domain from which Google should accept requests and also the domain where it should send our user info. This will require us to setup an auth consent screen with google which can be done easily with the help of guidance from the developer console.

The scopes that we provide here are the pieces of information that our cognito app will request from google.

Next we will be setting up the client. This will provide us with the credentials we need to be able to work with cognito APIs from the frontend.

```typescript
const userPoolClient = new cognito.UserPoolClient(this, "amplifyClient", {
  userPool,
  oAuth: {
    callbackUrls: ["http://localhost:8000/"], // This is what user is allowed to be redirected to with the code upon signin. this can be a list of urls.
    logoutUrls: ["http://localhost:8000/"], // This is what user is allowed to be redirected to after signout. this can be a list of urls.
  },
});
```

Then we also need to add a cognito domain which will serve up the login form. It is important to keep track of the `domainPrefix` that we set here because this is what we will be using in our google developer console. Which will have to be setup before we deploy this Cognito through CDK since it already requires the google console's client ids.

In the dev console you will need to enter:

- **Authorised JavaScript origins**:

  - `https://DOMAIN-PREFIX.auth.eu-west-1.amazoncognito.com`

- **Authorised redirect URIs**:
  - `https://DOMAIN-PREFIX.auth.eu-west-1.amazoncognito.com/oauth2/idpresponse`

```typescript
const domain = userPool.addDomain("domain", {
  cognitoDomain: {
    domainPrefix: "DOMAIN-PREFIX",
  },
});
```

![google-dev-console](images/google-dev-console-1.png)

## Cleanup

```
cdk destroy
```
