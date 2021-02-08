import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

import { env } from "process";
import * as AWS from "aws-sdk";
var rdsdataservice = new AWS.RDSDataService();

interface QueryParams {
  resourceArn: string;
  secretArn: string;
  database: string;
  sql: string;
}

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  console.log(env.CLUSTER_ARN, "  CLUSTER_ARN");
  console.log(env.SECRET_ARN, "tablesecret");

  try {
    // Defining parameters for rdsdataservice
    const dbcarn = env.CLUSTER_ARN || "p";
    const dbsarn = env.SECRET_ARN || "o";
    var params: QueryParams = {
      resourceArn: dbcarn,
      secretArn: dbsarn,
      database: "new",
      sql: "",
      //   "CREATE TABLE IF NOT EXISTS records (recordid INT PRIMARY KEY, title VARCHAR(255) NOT NULL, release_date DATE);",
    };
    params["sql"] = "select * from records";
    const data = await rdsdataservice.executeStatement(params).promise();
    // var body = {
    //   records: data,
    // };
    var params: QueryParams = {
      resourceArn: dbcarn,
      secretArn: dbsarn,
      database: "new",
      sql:
        "INSERT INTO records(recordid,title,release_date) VALUES(001,'Liberian Girl','2012-05-03');",
    };

    const data2 = await rdsdataservice.executeStatement(params).promise();
    var params: QueryParams = {
      resourceArn: dbcarn,
      secretArn: dbsarn,
      database: "new",
      sql: "select * from records;",
    };
    const data3 = await rdsdataservice.executeStatement(params).promise();
    var body = {
      records: data3,
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
