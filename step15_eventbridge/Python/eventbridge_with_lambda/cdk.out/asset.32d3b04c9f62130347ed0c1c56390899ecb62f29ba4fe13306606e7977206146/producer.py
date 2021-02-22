// const AWS = require("aws-sdk");
import json
import boto3

# Create CloudWatchEvents client
cloudwatch_events = boto3.client('events')


def handler(event, context):
    print(event["body"])
    body = event["body"]
    print(body)
    console.log("EVENT BODY: \n", event["body"])
#  const eventBridge = new AWS.EventBridge({ region: "eu-west-1" });
    response = cloudwatch_events.put_events(
        Entries=[
            {
                'EventBusName': "default",
                'Detail': json.dumps({ "country": "{"body['country']"}"}),
                'DetailType': 'order',
                'Source': 'custom.api'
            }
        ]
    )
    print(response['Entries'])


  return {
    "statusCode": 200,
    "headers":  json.dumps({ "Content-Type": "text/html" }),
    "body": "Event Published to Eventbridge" + json.dumps(response)

}






