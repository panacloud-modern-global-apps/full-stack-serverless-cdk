import { EventBridgeEvent, Context } from 'aws-lambda';
import { randomBytes } from 'crypto';
import * as AWS from 'aws-sdk';

const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.DYNAMO_TABLE_NAME as string;

export type PayloadType = {
    operationSuccessful: boolean,
    SnsMessage?: string,
}

export const handler = async (event: EventBridgeEvent<string, any>, context: Context) => {

    console.log(JSON.stringify(event, null, 2));
    const returningPayload: PayloadType = { operationSuccessful: true };

    try {
        //////////////  adding new time slot /////////////////////////
        if (event["detail-type"] === "addTimeSlot") {
            // console.log("detail===>", JSON.stringify(event.detail, null, 2));
            const params = {
                TableName: TABLE_NAME,
                Item: { id: randomBytes(16).toString("hex"), ...event.detail },
            }
            await dynamoClient.put(params).promise();
        }

        //////////////  deleting time slot /////////////////////////
        else if (event["detail-type"] === "deleteTimeSlot") {
            // console.log("detail===>", JSON.stringify(event.detail, null, 2));
            const params = {
                TableName: TABLE_NAME,
                Key: { id: event.detail.id },
            }
            await dynamoClient.delete(params).promise();
        }

        //////////////  booking time slot /////////////////////////
        else if (event["detail-type"] === "bookTimeSlot") {
            const params = {
                TableName: TABLE_NAME,
                Key: { "id": event.detail.id },
                UpdateExpression: "set #isBooked = :booking",
                ExpressionAttributeNames: { '#isBooked': 'isBooked' },
                ExpressionAttributeValues: {
                    ":booking": true
                },
                ReturnValues: "UPDATED_NEW" // NONE | ALL_OLD | UPDATED_OLD | ALL_NEW | UPDATED_NEW,
            };
            await dynamoClient.update(params).promise();
            // adding sns message
            returningPayload.SnsMessage = 'Request of booking timeSlot';
        }

        //////////////  canceling booked time slot /////////////////////////
        else if (event["detail-type"] === "cancelBooking") {
            const params = {
                TableName: TABLE_NAME,
                Key: { "id": event.detail.id },
                UpdateExpression: "set #isBooked = :booking",
                ExpressionAttributeNames: { '#isBooked': 'isBooked' },
                ExpressionAttributeValues: { ":booking": false },
                ReturnValues: "UPDATED_NEW" // NONE | ALL_OLD | UPDATED_OLD | ALL_NEW | UPDATED_NEW,

            };
            await dynamoClient.update(params).promise();
            // adding sns message
            returningPayload.SnsMessage = 'Request of canceling timeSlot';
        }

        //////////////  canceling all booked time slots /////////////////////////
        else if (event["detail-type"] === "cancelAllBooking") {

            const data = await dynamoClient.scan({ TableName: TABLE_NAME }).promise()

            data.Items?.forEach(async ({ id }) => {
                console.log("ID ===>> ", id)
                const params = {
                    TableName: TABLE_NAME,
                    Key: { "id": id },
                    UpdateExpression: "set #isBooked = :booking",
                    ExpressionAttributeNames: { '#isBooked': 'isBooked' },
                    ExpressionAttributeValues: { ":booking": false },
                    ReturnValues: "NONE" // NONE | ALL_OLD | UPDATED_OLD | ALL_NEW | UPDATED_NEW,
                };
                await dynamoClient.update(params).promise();
            })
        }

        return returningPayload;

    } catch (error) {
        console.log("ERROR ====>", error);
        returningPayload.operationSuccessful = false;
        return returningPayload;

    }




};