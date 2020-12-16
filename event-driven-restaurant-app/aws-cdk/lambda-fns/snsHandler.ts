import { Context } from 'aws-lambda';

export const handler = async (event: any, context: Context) => {
    console.log(JSON.stringify(event, null, 2));

}