# Sending Events to Eventbridge from AppSync GraphQL APIs

## Introduction

Since we are interested in utilizing the benefits of GraphQL on the client side, our main entry point to the backend infrastructure is going to be AppSync. We also want to take advantage of **Event Driven Asynchronous Architecture**, for which we would like to generate custom events by sending queries/mutations to the GraphQL API from the frontend.

Normally with Appsync when we want to integrate some AWS service we use it as a **DataSource**. Like we have seen before with **DynamoDbDataSource** and **LambdaDataSource**. As of the time of writing this (**DECEMBER 2020**) we do not have any Eventbridge data source available to directly integrate with Appsync. Instead we will utilize the APIs that AWS provides for all of its services. We are going to do this by using an **HttpDataSource**. [You can read more about invoking AWS services from AppSync via HTTP from the docs](https://docs.aws.amazon.com/appsync/latest/devguide/tutorial-http-resolvers.html#invoking-aws-services).

## Eventbridge API

The specific API that we are interested in, is the [PutEvents API](https://docs.aws.amazon.com/eventbridge/latest/APIReference/API_PutEvents.html). We will need to send an Http POST request to the appropriate Eventbridge Endpoint. [Here is a list of all Eventbridge Endpoints](https://docs.aws.amazon.com/general/latest/gr/ev.html). The body of our request will contain an object like this:

```json
{
  "Entries": [
    {
      "Detail": "string",
      "DetailType": "string",
      "EventBusName": "string",
      "Resources": ["string"],
      "Source": "string",
      "Time": number
    }
  ]
}
```

Entries is an array that allows us to send upto 10 events in a batch. The actual payload of our event will go into the `Detail` field.

The response object will look something like :

```json
{
  "Entries": [
    {
      "ErrorCode": "string",
      "ErrorMessage": "string",
      "EventId": "string"
    }
  ],
  "FailedEntryCount": number
}
```

We will also need to send some Auth Headers which will be done through the CDK when we are defining the **HttpDataSource** and Resolvers.

## Implementation

1. Create API.
2. Add HttpDataSource.
3. Create Request and Response Mapping Templates (VTL).
4. Create Resolvers.

## Testing our API.

1. Go to Lambda Console and Select our Echo function and open the **View Cloudwatch Logs**. (Keep the logs open)
2. Go to the AppSync Console. 
3. Run the createEvent Mutation.
4. Observe that the lambda logs will have a new entry.