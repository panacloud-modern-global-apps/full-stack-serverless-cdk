# Appsync without any data source

## Introduction

So far we have discussed how to use lambda and dynamoDb as datasources for Appsync. In this step we will be seeing an example in which the Appsync has no data source. In other words it is not connected to any other service for saving or processing the incoming data. 

Appsync with no data source is usually used when you wish to invoke a GraphQL operation without connecting to a data source, such as performing data transformation with resolvers or triggering a subscription to be invoked from a mutation. 

This could be very useful in scenarios where you want to subscribe to the status of some back-end process from client-side. In this case you can run the mutation from back-end which just updates the status without saving it to any database and your client-side can subscribe to it.

The example shown in this step passes the exact data from input to output. You can also apply some data transformation using vtl in the request and response mapping templates if need be.

[Read more about Data Sources](https://docs.aws.amazon.com/appsync/latest/APIReference/API_DataSource.html).

[learn more about Appsync CDK](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-appsync-readme.html)



