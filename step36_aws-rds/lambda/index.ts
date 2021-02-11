import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { env } from "process";

const value = env.INSTANCE_CREDENTIALS || "";
const envvalue: any = JSON.parse(value);

// Require and initialize outside of your main handler
const mysql = require("serverless-mysql")({
  config: {
    host: env.HOST,
    database: envvalue.dbname,
    user: "admin",
    password: envvalue.password,
  },
});

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  // If you're using AWS Lambda with callbacks, be sure to set context.callbackWaitsForEmptyEventLoop = false; in your main handler. This will allow the freezing of connections and will prevent Lambda from hanging on open connections. See here for more information. If you are using async functions, this is no longer necessary.
  // context.callbackWaitsForEmptyEventLoop = false;
  try {
    // Connect to your MySQL instance first
    await mysql.connect();
    // Get the connection object
    // let connection = mysql.getClient()

    // Simple query
    let resultsa = await mysql.query(
      "CREATE TABLE IF NOT EXISTS new (task_id INT AUTO_INCREMENT, description TEXT, PRIMARY KEY (task_id))"
    );

    console.log(resultsa, "results from database");

    //  close the connection
    await mysql.end();

    // first query
    // "CREATE TABLE IF NOT EXISTS new (task_id INT AUTO_INCREMENT, description TEXT, PRIMARY KEY (task_id))"
    // second query
    // "insert into new (task_id, description) values(20,'complete the project')",
    // third query
    // "SELECT * FROM new"

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: `Hello, CDK! You've created ${JSON.stringify(resultsa, null, 2)}\n`,
    };
  } catch (e) {
    console.log(e, "error from lambda");
    return {
      statusCode: 400,
      headers: { "Content-Type": "text/plain" },
      body: `Error creating table${JSON.stringify(e, null, 2)} \n`,
    };
  }
}
