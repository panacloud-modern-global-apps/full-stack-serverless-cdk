import * as AWS from "aws-sdk";

exports.handler = async (event: any) => {
    console.log("request:", JSON.stringify(event, undefined, 2));

    const sns = new AWS.SNS();

    const params = {
        Message: 'This is Hello World Event Message',
        TopicArn: process.env.TOPIC_ARN
    };

    try{
        await sns.publish(params).promise();
        return {
            statusCode: 200,
            headers: { "Content-Type": "text/plain" },
            body: `Hello, CDK! You've hit ${event.path}\n`
        };
    }
    catch(err){
        console.log(err);
        return {
            statusCode: 400,
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(err)
        };
    }
}