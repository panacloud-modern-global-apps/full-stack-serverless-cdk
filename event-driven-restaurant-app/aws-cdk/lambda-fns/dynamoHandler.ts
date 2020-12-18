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
                Item: { id: randomBytes(16).toString("hex"), ...event.detail, isBooked: false },
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
            // geting the time slot by id
            const data = await dynamoClient.get({
                TableName: TABLE_NAME,
                Key: { id: event.detail.id },
                AttributesToGet: ["isBookingRequested", "bookingRequestBy"]
            }).promise();

            // if the time slot has a booking request than booked for that user
            if (data.Item?.isBookingRequested) {
                const params = {
                    TableName: TABLE_NAME,
                    Key: { "id": event.detail.id },
                    UpdateExpression: "set isBooked = :_isBooked, bookedBy = :_bookedBy, isBookingRequested = :_isBookingRequested, bookingRequestBy = :_bookingRequestBy",
                    ExpressionAttributeValues: {
                        ":_isBooked": true,
                        ":_bookedBy": data.Item?.bookingRequestBy, // userName
                        ":_isBookingRequested": false,
                        ":_bookingRequestBy": ""
                    },
                    ReturnValues: "UPDATED_NEW" // NONE | ALL_OLD | UPDATED_OLD | ALL_NEW | UPDATED_NEW,
                };
                await dynamoClient.update(params).promise();
                // adding sns message
                returningPayload.SnsMessage = 'Request of booking timeSlot';
            }
        }

        //////////////  adding booking time slot request /////////////////////////
        else if (event["detail-type"] === "addBookingRequest") {
            const params = {
                TableName: TABLE_NAME,
                Key: { "id": event.detail.id },
                UpdateExpression: "set isBookingRequested = :booleanValue, bookingRequestBy = :userName",
                ExpressionAttributeValues: {
                    ":booleanValue": true,
                    ":userName": event.detail.userName
                },
                ReturnValues: "UPDATED_NEW" // NONE | ALL_OLD | UPDATED_OLD | ALL_NEW | UPDATED_NEW,
            };
            await dynamoClient.update(params).promise();
            // adding sns message
            returningPayload.SnsMessage = 'Request of booking timeSlot';
        }

        //////////////  deleting booking time slot request /////////////////////////
        else if (event["detail-type"] === "deleteBookingRequest") {
            const params = {
                TableName: TABLE_NAME,
                Key: { "id": event.detail.id },
                UpdateExpression: "set isBookingRequested = :booleanValue, bookingRequestBy = :userName",
                ExpressionAttributeValues: {
                    ":booleanValue": false,
                    ":userName": ''
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
                UpdateExpression: "set isBooked = :_isBooked, bookedBy = :_bookedBy",
                ExpressionAttributeValues: {
                    ":_isBooked": false,
                    ":_bookedBy": "",
                },
                ReturnValues: "UPDATED_NEW" // NONE | ALL_OLD | UPDATED_OLD | ALL_NEW | UPDATED_NEW,
            };
            await dynamoClient.update(params).promise();
            // adding sns message
            returningPayload.SnsMessage = 'Request of canceling timeSlot';
        }

        //////////////  canceling all booked time slots /////////////////////////
        else if (event["detail-type"] === "resetAllBookings") {

            const data = await dynamoClient.scan({ TableName: TABLE_NAME }).promise()

            data.Items?.forEach(async ({ id }) => {
                console.log("ID ===>> ", id)
                const params = {
                    TableName: TABLE_NAME,
                    Key: { "id": id },
                    UpdateExpression: "set isBooked = :_isBooked, bookedBy = :_bookedBy, isBookingRequested = :_isBookingRequested, bookingRequestBy = :_bookingRequestBy",
                    ExpressionAttributeValues: {
                        ":_isBooked": false,
                        ":_bookedBy": "",
                        ":_isBookingRequested": false,
                        ":_bookingRequestBy": ""
                    },
                    ReturnValues: "NONE" // NONE | ALL_OLD | UPDATED_OLD | ALL_NEW | UPDATED_NEW,
                };
                await dynamoClient.update(params).promise();
            })
        }

        //////////////////////////////////  Returning Final Response ///////////////////////////////////////
        return returningPayload;

    } catch (error) {
        console.log("ERROR ====>", error);
        returningPayload.operationSuccessful = false;
        return returningPayload;

    }




};