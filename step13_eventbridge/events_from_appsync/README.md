# Sending Events to Eventbridge from AppSync GraphQL APIs

## Introduction

Since we are interested in utilizing the benefits of GraphQL on the client side, our main entry point to the backend infrastructure is going to be AppSync. We also want to take advantage of **event driven asynchronous architecture**, for which we would like to generate custom events by sending queries/mutations to the GraphQL API from the frontend.

Normally with Appsync when we want to integrate some AWS service we use it as a **DataSource**. Like we have seen before with **DynamoDbDataSource** and **LambdaDataSource**. As of the time of writing this **4 DEC 2020** we do not have any Eventbridge data source available to directly integrate with. Instead we will utilize the APIs that AWS provides for all of its services. We are going to do this by using an **HttpDataSource**.