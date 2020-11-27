import fetch from "cross-fetch"
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client"

export const client = new ApolloClient({
  link: new HttpLink({
    uri:
      "GRAPHQL_ENDPOINT", // ENTER YOUR GRAPHQL ENDPOINT HERE
    fetch,
    headers: {
      "x-api-key": "APPSYNC_API_KEY", // ENTER YOUR API KEY HERE
    },
  }),
  cache: new InMemoryCache(),
})