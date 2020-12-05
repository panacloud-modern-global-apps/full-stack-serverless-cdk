# Integrate AppSync with DynamoDB as a Datasource

![alt text](https://github.com/panacloud-modern-global-apps/full-stack-serverless-cdk/blob/main/step08_appsync_dynamodb_as_datasource_mappingtemplate_methods/img/appsync_dynamodb.png)

## Why AppSync?
Organizations choose to build APIs with GraphQL because it helps them develop applications faster, by giving front-end developers the ability to query multiple databases, microservices, and APIs with a single GraphQL endpoint.

AWS AppSync is a fully managed service that makes it easy to develop GraphQL APIs by handling the heavy lifting of securely connecting to data sources like AWS DynamoDB, Lambda, and more. Adding caches to improve performance, subscriptions to support real-time updates, and client-side data stores that keep off-line clients in sync are just as easy. Once deployed, AWS AppSync automatically scales your GraphQL API execution engine up and down to meet API request volumes.

## DataSource As DynamoDB
In this project we have used dynamo as a datasource which means our resolver will interact directly with dynamoDB for data operations.

## Appsync Mapping template VTL
In this repo we have used appsync mapping template VTL that will allow us to perform data operations very easily with few lines of code.

## Resolver Mapping Template
AWS AppSync lets you respond to GraphQL requests by performing operations on your resources. For each GraphQL field you wish to run a query or mutation on, a resolver must be attached in order to communicate with a data source. The communication is typically through parameters or operations that are unique to the data source.

Resolvers are the connectors between GraphQl and a data source. They tell AWS AppSync how to translate an incoming GraphQL request into instructions for your backend data source, and how to translate the response from that data source back into a GraphQL response. They are written in Apache Velocity Template Language (VTL), which takes your request as input and outputs a JSON document containing the instructions for the resolver. You can use mapping templates for simple instructions, such as passing in arguments from GraphQL fields, or for more complex instructions, such as looping through arguments to build an item before inserting the item into DynamoDB.

## Important Points on VTL
- $ctx and $context are both same it's just two ways to access context.
- Version in VTL these two (2017-02-28 and 2018-05-29) are currently supported.
- $ctx.args contains the data pass as an argument
- For array as a response use 
    ```
    $util.toJson($context.result.items)
    ```
- For single item response use 
    ```
    $util.toJson($context.result)
    ```
- We can define a variable with $ sign.
- The $util variable contains general utility methods that make it easier to work with data.

[MORE ABOUT UTILS](https://docs.aws.amazon.com/appsync/latest/devguide/resolver-util-reference.html)



[AWS AppSync Mapping Templates VTL](https://docs.aws.amazon.com/appsync/latest/devguide/resolver-mapping-template-reference-dynamodb.html#aws-appsync-resolver-mapping-template-reference-dynamodb-updateitem)

[DynamoDb as Datasource](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-appsync.DynamoDbDataSource.html)

Note, never print your API Key to the logs in a production system. This was added to make learning AppSync and GraphQL easier. If you want to use this pattern in a production system remove the two cloudformation outputs

## Test After deploy
1. After CDK Deploy, capture outputs from the log.
```
Outputs:
StepxxAppsyncDynamodbAsDatasourceStack.APIGraphQlURL = https://-------xxxxxxxxxxx.appsync-api.us-east-2.amazonaws.com/graphql
StepxxAppsyncDynamodbAsDatasourceStack.GraphQLAPIKey = -----------------------------
```

2. Setup Postman as outlined in Postman's Using [GraphQL Instructions](https://learning.postman.com/docs/sending-requests/supported-api-frameworks/graphql/)

3. Set POST request URL, x-api-key and Content-Type
    - x-api-key = 'your API Key'
    - Content-Type = application/graphql


## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
