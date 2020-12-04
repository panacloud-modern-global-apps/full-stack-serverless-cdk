const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        id: string;
        title: string;
    }
}

exports.handler = async (event: AppSyncEvent) => {
    const params = {
        TableName: process.env.TABLE,
        Item: event.arguments
    }
    try {
        await docClient.put(params).promise();
        return event.arguments;
    } catch (err) {
        console.log('DynamoDB error: ', err);
        return null;
    }
}