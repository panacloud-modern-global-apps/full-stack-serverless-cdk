# Integrate AppSync with Lambda as a Datasource

![alt text](https://github.com/panacloud-modern-global-apps/full-stack-serverless-cdk/blob/main/step03_appsync_lambda_as_datasource/img/img1.png)

First we will learn about GraphQL:

[Start Learning](https://graphql.org/learn/)

[Queries](https://graphql.org/learn/queries/)

[Schema](https://graphql.org/learn/schema/)

[AppSync](https://aws.amazon.com/appsync/)

[AppSync Docs](https://docs.aws.amazon.com/appsync/latest/devguide/welcome.html)

## Why AppSync?
Organizations choose to build APIs with GraphQL because it helps them develop applications faster, by giving front-end developers the ability to query multiple databases, microservices, and APIs with a single GraphQL endpoint.

AWS AppSync is a fully managed service that makes it easy to develop GraphQL APIs by handling the heavy lifting of securely connecting to data sources like AWS DynamoDB, Lambda, and more. Adding caches to improve performance, subscriptions to support real-time updates, and client-side data stores that keep off-line clients in sync are just as easy. Once deployed, AWS AppSync automatically scales your GraphQL API execution engine up and down to meet API request volumes.

## DataSource As Lambda
In this project we have used Lambda as a datasource which means our resolver will interact with lambda function for data operations.


[Building Real-time Serverless APIs with PostgreSQL, CDK, TypeScript, and AWS AppSync](https://aws.amazon.com/blogs/mobile/building-real-time-serverless-apis-with-postgres-cdk-typescript-and-aws-appsync/)


Note, never print your API Key to the logs in a production system. This was added to make learning AppSync and GraphQL easier. If you want to use this pattern in a production system remove the two cloudformation outputs

## Test After deploy
1. After CDK Deploy, capture outputs from the log.
```
Outputs:
StepxxAppsyncDynamodbAsDatasourceStack.APIGraphQlURL = https://-------xxxxxxxxxxx.appsync-api.us-east-2.amazonaws.com/graphql
StepxxAppsyncDynamodbAsDatasourceStack.GraphQLAPIKey = -----------------------------
```

2. Setup Postman as outlined in Postman's Using [GraphQL Instructions](https://learning.postman.com/docs/sending-requests/supported-api-frameworks/graphql/)

[Install Postman App](https://www.postman.com/downloads/)

3. Set POST request URL, x-api-key and Content-Type
    - x-api-key = 'your API Key'
    - Content-Type = application/graphql

[Step 03 Class Video in English on Facebook](https://www.facebook.com/zeeshanhanif/videos/10225249824337528)

[Step 03 Class Video in English on YouTube](https://www.youtube.com/watch?v=iJj32I9A_Nc)

[Step 03 Class Video in Urdu on Facebook](https://www.facebook.com/zeeshanhanif/videos/10225258717359848)

[Step 03 Class Video in Urdu on YouTube](https://www.youtube.com/watch?v=mzl8tQzygOA)



## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
