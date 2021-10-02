
import axios from 'axios'
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export async function handler(event: APIGatewayProxyEvent, context: Context) {

    try {

        // creates a person vertex with an age property set to 25

        await axios.post('HTTPS://' + process.env.NEPTUNE_ENDPOINT + ':8182/openCypher', 'query=CREATE (n:Person { age: 25 })')


        // retrieve the person created above and returning its age

        const fetch = await axios.post('HTTPS://' + process.env.NEPTUNE_ENDPOINT + ':8182/openCypher', 'query=MATCH (n:Person { age: 25 }) RETURN n.age')

        console.log('RESPONSE', fetch.data.results)

        return {
            statusCode: 200,
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(fetch.data.results),
          };

    }
    catch (e) {
        console.log('error', e)

        return {
            statusCode: 500,
            headers: { "Content-Type": "text/plain" },
            body: "error occured",
          };
    }



}