import { EventBridgeEvent, Context } from 'aws-lambda';
import { randomBytes } from 'crypto';
import * as AWS from 'aws-sdk';

const dynamoClient = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: EventBridgeEvent<string, any>, context: Context) => {

    console.log(JSON.stringify(event, null, 2));

    if (event["detail-type"] === "addTimeSlot") {
        // console.log("detail===>", JSON.stringify(event.detail, null, 2));
        const params = {
            TableName: process.env.DYNAMO_TABLE_NAME as string,
            Item: { id: randomBytes(16).toString("hex"), ...event.detail },
        }
        await dynamoClient.put(params).promise();
    }
    else if (event["detail-type"] === "deleteTimeSlot") {
        // console.log("detail===>", JSON.stringify(event.detail, null, 2));
        const params = {
            TableName: process.env.DYNAMO_TABLE_NAME as string,
            Key: { id: event.detail.id },
        }
        await dynamoClient.delete(params).promise();
    }
    else if (event["detail-type"] === "bookTimeSlot") {
        const params = {
            TableName: process.env.DYNAMO_TABLE_NAME as string,
            Key: { "id": event.detail.id },
            UpdateExpression: "set #isBooked = :booking",
            ExpressionAttributeNames: { '#isBooked': 'isBooked' },
            ExpressionAttributeValues: {
                ":booking": true,
                ":prodPrice": 300
            },
            ReturnValues: "UPDATED_NEW" // NONE | ALL_OLD | UPDATED_OLD | ALL_NEW | UPDATED_NEW,

        };
        await dynamoClient.update(params).promise();
    }
    else if (event["detail-type"] === "cancelBooking") {
        // console.log("detail===>", JSON.stringify(event.detail, null, 2));
        // const params = {
        //     TableName: process.env.DYNAMO_TABLE_NAME as string,
        //     Item: { id: randomBytes(16).toString("hex"), ...event.detail },
        // }
        // await dynamoClient.put(params).promise();
    }
};