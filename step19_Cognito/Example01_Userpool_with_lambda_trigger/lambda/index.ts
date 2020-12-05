const aws = require('aws-sdk');
const ses = new aws.SES();
const ADM_EMAIL = 'your_email@verifiedmail.com'; // verified receiver’s email
const NO_REPLY_EMAIL = 'some_email@verifiedmail.com'; // verified sender’s email

exports.handler = async (event: any) => {
    const attributes = event.request.userAttributes;  // read user attributes from an event
    await sendNotification(attributes.name, attributes.email);
    return event; // pass event object back, as Cognito expects it to be returned
}

const sendNotification = (userName: string, userEmail: string) => {
    const notificationText = `
    New user ${userName} with email: ${userEmail} successfully registered!
    `
    return new Promise((resolve, reject) => {
        const params = {
            Destination: {
                ToAddresses: [ADM_EMAIL]
            },
            Message: {
                Body: {
                    Text: {
                        Data: notificationText
                    }
                },
                Subject: {
                    Data: "Welcome to our App"
                }
            },
            Source: NO_REPLY_EMAIL
        };
        ses.sendEmail(params, (err: any, data: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}