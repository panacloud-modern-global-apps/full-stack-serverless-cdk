import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { env } from "process";

// Require and instantiate data-api-client with secret and cluster

const dbcarn = env.CLUSTER_ARN || "p";
const dbsarn = env.SECRET_ARN || "o";

const data = require("data-api-client")({
  secretArn: dbsarn,
  resourceArn: dbcarn,
  database: "mydb", // default database
});

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  console.log(env.CLUSTER_ARN, "CLUSTER_ARN");
  console.log(env.SECRET_ARN, "tablesecret");

  try {
    const result = await data.query(
      "CREATE TABLE IF NOT EXISTS records (recordid INT PRIMARY KEY, title VARCHAR(255) NOT NULL, release_date DATE);"
    );
    var body = {
      records: result,
    };

    return {
      statusCode: 200,
      headers: {},
      body: JSON.stringify(body),
    };
  } catch (error) {
    console.log(error, "error");
    return {
      statusCode: 400,
      headers: {},
      body: `Hello, CDK! You've \n`,
    };
  }
}
