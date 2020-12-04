const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

async function deleteTodo(todoId: string) {
    const params = {
        TableName: process.env.TODOS_TABLE,
        Key: {
            id: todoId
        }
    }
    try {
        await docClient.delete(params).promise()
        return todoId
    } catch (err) {
        console.log('DynamoDB error: ', err)
        return null
    }
}

export default deleteTodo;