const aws = require('aws-sdk');

exports.handler = (event: any, context: any, callback: any) => {
    console.log(event);

    event.response.autoConfirmUser = true;
    
    ///If email exists marked it as verified
    if (event.request.userAttributes.hasOwnProperty("email")) {
        event.response.autoVerifyEmail = true;
    }

    ///If phone exists marked it as verified
    if (event.request.userAttributes.hasOwnProperty("phone_number")) {
        event.response.autoVerifyPhone = true;
    }

    // Return to Amazon Cognito
    callback(null, event);
}