# Connecting to Appsync GraphQL API with Apollo Client

## Introduction
By this time we have had a lot of practice with gatsby and using GraphQL APIs made with `Apollo-Server`. Then we used them in the frontend with the help of `Apollo-Client`,  `ApolloProvider` and `wrap-root-element` of gatsby.

The difference with AppSync is that we usually add some form of *authorization*. For now we have added `API_KEY` as the authorization type.  

```javascript
authorizationType: appsync.AuthorizationType.API_KEY
```

That means our AppSync backend will only respond to graphql requests that have a valid `API_KEY`. You can read about the different [types of authorization supported by AppSync](https://docs.aws.amazon.com/appsync/latest/devguide/security.html#aws-appsync-security).

## Connecting to Appsync with header

![api_key_auth from aws docs](auth_api_key.png)

You can see from this portion of the aws docs that on the client the API key is specified by the header `x-api-key`.
So when we are creating our `Apollo-Client` for use with `wrap-root-element` we will just add our api key as a header.

```javascript
import fetch from "cross-fetch"
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client"

export const client = new ApolloClient({
  link: new HttpLink({
    uri:
      "GRAPHQL_ENDPOINT",
    fetch,
    headers: {
      "x-api-key": "APPSYNC_API_KEY",
    },
  }),
  cache: new InMemoryCache(),
})

```