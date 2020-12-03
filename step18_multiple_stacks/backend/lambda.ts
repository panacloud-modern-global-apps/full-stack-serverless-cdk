import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
const randomName = require('node-random-name');

exports.handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {

    const name = randomName();

    console.log("Random Name ==>", name);

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
            randomName: name,
        }),
    }
}