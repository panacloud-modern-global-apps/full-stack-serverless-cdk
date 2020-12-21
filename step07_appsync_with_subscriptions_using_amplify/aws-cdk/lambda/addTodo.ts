import { randomBytes } from 'crypto';
import { TodoInput } from './Todo';
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

async function addTodo(todo: TodoInput) {
    const params = {
        TableName: process.env.TODOS_TABLE,
        Item: { id: randomBytes(16).toString("hex"), ...todo }
    }
    try {
        await docClient.put(params).promise();
        return { ...params.Item };
    } catch (err) {
        console.log('DynamoDB error: ', err);
        return null;
    }
}

export default addTodo;


