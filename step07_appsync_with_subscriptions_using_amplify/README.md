# Connecting to Appsync GraphQL API with AWS Amplify

## Introduction Appsync Subscriptions

To subscribe to real-time updates, we’ll use the API category and pass in the subscription we’d like to listen to. Any time a new mutation we are subscribed to happens, the data will be sent to the client application in real-time.
We have already seen how to integrate appsync with apollo client. There is another way to do it using amplify. The advantage of using amplify is that you do not have to define a complex client especially if you are using subscriptions.
The client-side configuration of a secured appsync is also quit easy to define using this method. A secured Appsync can have various authorization methods. The one we are using in this example is procted by an API-KEY.

[Read more about subscription here](https://docs.aws.amazon.com/appsync/latest/devguide/real-time-websocket-client.htmly).
[Also check this article](https://aws.amazon.com/blogs/mobile/building-scalable-graphql-apis-on-aws-with-cdk-and-aws-appsync/)

[Read more about authentication types](https://docs.aws.amazon.com/appsync/latest/devguide/security.html#aws-appsync-security).

The following steps are also mentioned in the Amplify docs. [Click here to read them](https://docs.amplify.aws/lib/graphqlapi/getting-started/q/platform/ios)


## Preparing Gatsby frontend

### Step 1: Create a gatsby Hello world project

```
gatsby new gatsby-frontend https://github.com/gatsbyjs/gatsby-starter-hello-world
```

### Step 2: Install the Amplify CLI

```
npm install -g @aws-amplify/cli
```

### Step 3: Configure Amplify

```
amplify configure
```

### Step 4: Initialize Amplify in your gatsby project. In the root directory of your gatsby project run the following command

```
amplify init
```

### Step 5: Integrate Amplify with your Appsync by running the following command

```
amplify add codegen --apiId ENTER_YOUR_API_ID
```
you can get this id from your AWS Appsync console. 

These steps will create a graphql folder and a aws-exports.js file in the src directory of your gatsby project. The graphql folder has all the queries, mutations and subscriptions defined in your schema.
The aws-exports.js file has looks like this. 

```
const awsmobile = {
    "aws_project_region": "******ADD YOUR REGION HERE: example (us-east-1) *********",
    "aws_appsync_graphqlEndpoint": "******ADD YOUR GRAPHQL ENDPOINT HERE*********",
    "aws_appsync_region": "******ADD YOUR REGION HERE: example (us-east-1) *********",
    "aws_appsync_authenticationType": "API_KEY",
    "aws_appsync_apiKey": "********ADD YOUR GRAPHQL API KEY HERE*********"
};


export default awsmobile;

```
You will have to enter all these parameters to configure Amplify with your Appsync.

NOTE: YOU CAN SKIP STEPS 3, 4 and 5, BUT IN THIS CASE YOU WOULD HAVE TO MAKE  "aws-exports.js" FILE MANUALLY AND YOU WOULD NOT BE ABLE TO RUN "amplify add codegen --apiId ENTER_YOUR_API_ID", THEREFORE YOU WOULD HAVE TO DEFINE YOUR QUERIES, MUTATIONS AND SUBSCRIPTIONS MANUALLY (AMPLIFY WOULD NOT CREATE THEM FOR YOU)

### Step 6: Create a client to pass the Amplify configuration to all the pages and components in your gatsby project.

```javascript
// src/amplifyContext/client.tsx

import React, { ReactNode } from "react"
import Amplify from "aws-amplify"
import awsmobile from "../aws-exports"

interface props {
  children: ReactNode
}

export default function amplifyClient({ children }: props) {
  Amplify.configure(awsmobile)

  return <div>{children}</div>
}

```
### Step 7: Wrap the root element with this client

```javascript
//src/wrappers/wrap-root-element.tsx

import React from "react"
import AmplifyClient from "../amplifyContext/client"

export default ({ element }) => <AmplifyClient>{element}</AmplifyClient>

```
<br>

### Step 8: Export the 'Wrap-root-element' that you made in step 7 from gatsby-browser.js and gatsby-ssr.js files (just like you did in Apollo Client)

<br>
<br>

### Step 9: Use 'aws-amplify' library to run queries, mutations and subscriptions. Example given below
```javascript
import { API } from "aws-amplify";

// queries
const data = await API.graphql({ query: getTodos, })

// mutations
const data = await API.graphql({
        query: addTodo,
        variables: {
          todo: todo,
        },
      })

// subscriptions
const subscription = API.graphql(graphqlOperation(onAddTodo));

function handleSubscription() {
    subscription.subscribe({
      next: (status) => {   // when mutation will run the next will trigger
        console.log("New SUBSCRIPTION ==> ", status.value.data);
      },
    })
  }

useEffect(() => {
    handleSubscription(); // will make a subscription connection for the first time
  }, [])

```


[Learn more about Amplify](https://docs.amplify.aws/)

[learn more about Appsync CDK](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-appsync-readme.html)



