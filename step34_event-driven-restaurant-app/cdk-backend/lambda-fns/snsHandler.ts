import { Context } from 'aws-lambda';
import { SNS,SES } from 'aws-sdk';
import { PayloadType } from './dynamoHandler';

const sns = new SNS();
var ses = new SES({ region: process.env.OUR_REGION });

export const handler = async (event: PayloadType, context: Context) => {
    console.log("event",event);

    // if (!event.operationSuccessful) {
    //     return { message: "operation not successful" }
    // }

    try {

        if (event.SnsMessage && !event.customerEmail) {
            // sending message to TOPIC ARN
            await sns.publish({
                TopicArn: process.env.SNS_TOPIC_ARN,
                Message: event.SnsMessage,
            }).promise()
            console.log('message published');

            // sending message to Phone Number
            await sns.publish({
                Message: event.SnsMessage,
                PhoneNumber: process.env.PHONE_NUMBER,
            }).promise()
            console.log('message sent to Phone.no:', process.env.PHONE_NUMBER);

        }
    }
    catch (err) {
        console.error('ERROR Publishing To SNS ====>', JSON.stringify(err, null, 2));
        throw new Error(err.message)
    }

    return { message: "operation successful" }

}