# Gatsby Frontend

The frontend is based on [Gatsbyjs](https://www.gatsbyjs.com/). Setup the application in your local-machine by following the steps:

- Install the dependencies `npm install`.

- Create a file `aws-exports.js` inside `src` folder and add the following values:
```javascript
// src/aws-exports.js
const awsmobile = {
    "aws_project_region": "<your aws project region>",
    "aws_appsync_graphqlEndpoint": "<your Graphql_Endpoint>",
    "aws_appsync_region": "<your appsync region>",
    "aws_appsync_authenticationType": "AMAZON_COGNITO_USER_POOLS",
    "Auth": {
        "region": "<your aws project region>",
        "userPoolId": "<Your UserPoolId>",
        "userPoolWebClientId": "<Your UserPoolClientId>"
    }

};

export default awsmobile;

```

- Run your application by the command `gatsby develop`.

You can see your app running on `http://localhost:8000`.