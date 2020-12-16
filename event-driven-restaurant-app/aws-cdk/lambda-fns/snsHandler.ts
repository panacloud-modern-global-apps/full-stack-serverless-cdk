import { Context } from 'aws-lambda';
import { SNS } from 'aws-sdk';
import { PayloadType } from './dynamoHandler';

const sns = new SNS();

export const handler = async (event: PayloadType, context: Context) => {
    console.log(JSON.stringify(event, null, 2));

    // if (event.SnsMessage) {
    //     sns.publish({
    //         TopicArn: process.env.SNS_TOPIC_ARN,
    //         Message: event.SnsMessage,
    //     }, function (err, data) {
    //         if (err) {
    //             console.error('ERROR Publishing To SNS ====>', JSON.stringify(err, null, 2));
    //             throw new Error(err.message)
    //         } else {
    //             console.info('message published to SNS');
    //         }
    //     }
    //     )
    // }



}