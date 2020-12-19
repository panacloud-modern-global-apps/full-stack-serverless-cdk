import * as cdk from "@aws-cdk/core";
import {
  CfnApiKey,
  MappingTemplate,
  GraphqlApi,
  PrimaryKey,
  Values,
  Schema,
  FieldLogLevel,
} from "@aws-cdk/aws-appsync";
import { AttributeType, Table } from "@aws-cdk/aws-dynamodb";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as origins from "@aws-cdk/aws-cloudfront-origins";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import { join } from "path";
import * as lambda from "@aws-cdk/aws-lambda";

export class AwsCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    //////////////////////// deploying appsync graphql backend ////////////////////////////////

    // Create a new AppSync GraphQL API
    const api = new GraphqlApi(this, "Api", {
      name: `todosapi`,
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
      },
      schema: new Schema({
        filePath: join("__dirname", "/../", "schema/schema.graphql"),
      }),
    });

    // Create new DynamoDB Table for Todos
    const todosTable = new Table(this, "TodosTable", {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
    });

    // created lambda
    const todosLambda = new lambda.Function(this, "AppsyncLambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "main.handler",
      code: lambda.Code.fromAsset("functions"),
      memorySize: 1024,
    });

    // added lambda as a datasource for appsync
    const lambdaDs = api.addLambdaDataSource("lambdaDatasource", todosLambda);

    // resolvers
    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "getTodos",
    });

    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "addTodo",
    });

    //logging GraphQL API Endpoint
    new cdk.CfnOutput(this, "Endpoint", {
      value: api.graphqlUrl,
    });
    //logging GraphQL API Key
    new cdk.CfnOutput(this, "API_Key", {
      value: api.apiKey || "",
    });
    //logging GraphQL API ID
    new cdk.CfnOutput(this, "API_ID", {
      value: api.apiId || "",
    });
  }
}
