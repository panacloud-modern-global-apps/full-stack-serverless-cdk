import * as AWS from "aws-sdk";

exports.handler = async (event: any) => {
    const {Success} = JSON.parse(event.body);

    const sns = new AWS.SNS();
    let params;

    if(Success){
        console.log('success')
        params = {
            Message: JSON.stringify({Success: true}),
            TopicArn: process.env.TOPIC_ARN
        };
    }
    else{
        console.log('fail')
        params = {
            Message: JSON.stringify({Success: false}),
            TopicArn: process.env.TOPIC_ARN
        };
    }

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