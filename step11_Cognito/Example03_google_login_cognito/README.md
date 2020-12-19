# Adding Google Signin to Cognito

## Dependencies

```
npm i @aws-cdk/aws-cognito
```

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