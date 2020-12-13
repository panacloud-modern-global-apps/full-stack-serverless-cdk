import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { SES } from "aws-sdk";

const ses = new SES();

interface EmailParam {
    to?: string;
    from?: string;
    subject?: string;
    text?: string;
}

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    console.log("REQUEST ==>>", event.body);

    const { to, from, subject, text } = JSON.parse(event.body||"{}") as EmailParam;

    if (!to || !from || !subject || !text) {
        return Responses._400({
            message: 'to, from, subject and text are all required in the body',
        });
    }

    const params = {
        Destination: {
            ToAddresses: [to],
        },
        Message: {
            Body: {
                Text: { Data: text },
            },
            Subject: { Data: subject },
        },
        Source: from,
    };

    try {
        await ses.sendEmail(params).promise();
        return Responses._200({ message: 'The email has been sent' });
    } catch (error) {
        console.log('error sending email ', error);
        return Responses._400({ message: 'The email failed to send' });
    }


}



const Responses = {
    _200(data: Object) {
        return {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Methods': '*',
                'Access-Control-Allow-Origin': '*',
            },
            statusCode: 200,
            body: JSON.stringify(data),
        };
    },

    _400(data: Object) {
        return {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Methods': '*',
                'Access-Control-Allow-Origin': '*',
            },
            statusCode: 400,
            body: JSON.stringify(data),
        };
    },
};