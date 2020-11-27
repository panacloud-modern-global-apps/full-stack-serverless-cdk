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