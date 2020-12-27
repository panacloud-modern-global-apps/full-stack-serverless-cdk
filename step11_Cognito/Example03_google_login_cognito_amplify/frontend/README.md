# Gatsby + Amplify Cognito with Google Signin.

## Dependencies:

```
npm i @aws-amplify/ui-react aws-amplify
```

## Sources:

- [Amplify Client Config](https://docs.amplify.aws/lib/client-configuration/configuring-amplify-categories/q/platform/js)
- [Amplify Hub](https://docs.amplify.aws/lib/utilities/hub/q/platform/js)

## Implementation

We will be communicating with Cognito by using Amplify. We will need to configure Amplify by filling in the `aws-exports.js` file with our credentials (enter http://localhost:8000 if testing frontend locally) and make sure that this is the same as what was entered in the callback url when deploying the cdk, otherwise you will face a redirect mismatch error.:

```javascript
// aws-exports.js;

/* eslint-disable */

const awsmobile = {
  aws_project_region: "eu-west-1", // REGION
  aws_cognito_region: "eu-west-1", // REGION
  aws_user_pools_id: "eu-west-1_xluFXgOKm", // ENTER YOUR USER POOL ID
  aws_user_pools_web_client_id: "1uiqf76uo9d9nesqq6s5ix92lm", // ENTER YOUR CLIENT ID
  oauth: {
    domain: "eru-test-pool.auth.eu-west-1.amazoncognito.com", // ENTER YOUR COGNITO DOMAIN LIKE: eru-test-pool.auth.eu-west-1.amazoncognito.com here 'eru-test-pool' is the domainPrefix I had set in the backend.
    scope: ["phone", "email", "openid", "profile"],
    redirectSignIn: "http://localhost:8000/", // ENTER YOUR SITE (enter http://localhost:8000 if testing frontend locally)
    redirectSignOut: "http://localhost:8000/", // ENTER YOUR SITE (enter http://localhost:8000 if testing frontend locally)
    responseType: "code",
  },
  federationTarget: "COGNITO_USER_POOLS",
};

export default awsmobile;
```

Since we only have one page for demonstrating the Google signin we will just import the Amplify Library in the index page and configure it there. The usual way to do this in a gatsby app would be to create a wrapper with context and configure it there.

So in index.js we will be using the `Hub` Provided by Amplify. You can read about it from the [AWS Docs](https://docs.amplify.aws/lib/utilities/hub/q/platform/js). It is like a basic pub sub where we can listen for amplify events. Here we are listening on the `auth` channel.

```javascript
import Amplify, { Auth, Hub } from "aws-amplify";

Hub.listen("auth", ({ payload: { event, data } }) => {
  switch (event) {
    case "signIn":
    case "cognitoHostedUI":
      getUser().then((userData) => setUser(userData));
      break;
    case "signOut":
      setUser(null);
      break;
    case "signIn_failure":
    case "cognitoHostedUI_failure":
      console.log("Sign in failure", data);
      break;
  }
});
```

And we can render a button that links us to the google signin by using `Auth.federatedSignIn({provider : "Google"})`. If we leave this empty by not specifying a provider like: `Auth.federatedSignIn()` then we will be redirected to the base cognito login form where we can use any other way of logging in like our default cognito userpool etc.

```jsx
<button onClick={() => Auth.federatedSignIn({ provider: "Google" })}>
  Sign In with Google
</button>
```
