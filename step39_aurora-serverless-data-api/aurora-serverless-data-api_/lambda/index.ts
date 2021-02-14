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


  try {
    // Defining parameters for rdsdataservice
    const dbcarn = env.CLUSTER_ARN || "";
    const dbsarn = env.SECRET_ARN || "";
    var params: QueryParams = {
      resourceArn: dbcarn,
      secretArn: dbsarn,
      database: "mydb",
      sql: "",
    };
    params["sql"] = "CREATE TABLE IF NOT EXISTS records (recordid INT PRIMARY KEY, title VARCHAR(255) NOT NULL, release_date DATE);";
    const data = await rdsdataservice.executeStatement(params).promise();
    var body = {
      records: data,
    };
    
// //     second query
//     var params: QueryParams = {
//       resourceArn: dbcarn,
//       secretArn: dbsarn,
//       database: "new",
//       sql:
//         "INSERT INTO records(recordid,title,release_date) VALUES(001,'Liberian Girl','2012-05-03');",
//     };

//     const data2 = await rdsdataservice.executeStatement(params).promise();
//        var body = {
//       records: data2,
//     };
    
    
    
// //     third query
//     var params: QueryParams = {
//       resourceArn: dbcarn,
//       secretArn: dbsarn,
//       database: "new",
//       sql: "select * from records;",
//     };
//     const data3 = await rdsdataservice.executeStatement(params).promise();
//     var body = {
//       records: data3,
//     };

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
      body: `Error creating table`,
    };
  }
}
