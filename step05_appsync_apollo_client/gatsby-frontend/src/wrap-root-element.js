import React from "react";
import { ApolloProvider } from "@apollo/client";
import { client } from "./apollo/client";

export default ({ element }) => (
  <ApolloProvider client={client}>
        {element}
  </ApolloProvider>
)
