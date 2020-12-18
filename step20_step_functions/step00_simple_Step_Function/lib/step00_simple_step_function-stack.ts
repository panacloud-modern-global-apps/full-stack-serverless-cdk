import * as cdk from '@aws-cdk/core';
import lambda = require("@aws-cdk/aws-lambda");
import * as ddb from "@aws-cdk/aws-dynamodb";
import * as stepFunctions from "@aws-cdk/aws-stepfunctions";
import * as stepFunctionTasks from "@aws-cdk/aws-stepfunctions-tasks";

export class Step00SimpleStepFunctionStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // created a dynamodb Table

    const DynamoTable = new ddb.Table(this, "DynamoTable", {
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    });

    // this function adds data to the dynamoDB table

    const addData = new lambda.Function(this, "addData", {
      runtime: lambda.Runtime.NODEJS_10_X, // execution environment
      code: lambda.Code.fromAsset("lambda"), // code loaded from "lambda" directory
      handler: "addData.handler",
    });

    // this function logs the status of the operation

    const echoStatus = new lambda.Function(this, "echoStatus", {
      runtime: lambda.Runtime.NODEJS_10_X, // execution environment
      code: lambda.Code.fromAsset("lambda"), // code loaded from "lambda" directory
      handler: "echoStatus.handler",
    });

    // giving access to the lambda function to do operations on the dynamodb table

    DynamoTable.grantFullAccess(addData);
    addData.addEnvironment("DynamoTable", DynamoTable.tableName);

    // creating steps for the step function

    const firstStep = new stepFunctionTasks.LambdaInvoke(
      this,
      "Invoke addData lambda",
      {
        lambdaFunction: addData,
      }
    );

    const secondStep = new stepFunctionTasks.LambdaInvoke(
      this,
      "Invoke echoStatus lambda",
      {
        lambdaFunction: echoStatus,
        inputPath: "$.Payload",
      }
    );

    // creating chain to define the sequence of execution

    const chain = stepFunctions.Chain.start(firstStep).next(secondStep);

    // create a state machine

    new stepFunctions.StateMachine(this, "simpleStateMachine", {
      definition: chain,
    });
  }
}
