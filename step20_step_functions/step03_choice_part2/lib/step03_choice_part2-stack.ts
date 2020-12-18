import * as cdk from "@aws-cdk/core";
import lambda = require("@aws-cdk/aws-lambda");
import * as ddb from "@aws-cdk/aws-dynamodb";
import * as stepFunctions from "@aws-cdk/aws-stepfunctions";
import * as stepFunctionTasks from "@aws-cdk/aws-stepfunctions-tasks";

export class Step03ChoicePart2Stack extends cdk.Stack {
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

    // giving access to the lambda function to do operations on the dynamodb table

    DynamoTable.grantFullAccess(addData);
    addData.addEnvironment("DynamoTable", DynamoTable.tableName);

    // this function prints "operation failed"

    const addDataFailed = new lambda.Function(this, "addDataFailed", {
      runtime: lambda.Runtime.NODEJS_10_X, // execution environment
      code: lambda.Code.fromAsset("lambda"), // code loaded from "lambda" directory
      handler: "addDataFailed.handler",
    });

    // this function prints "operation successful"

    const addDataSuccess = new lambda.Function(this, "addDataSuccess", {
      runtime: lambda.Runtime.NODEJS_10_X, // execution environment
      code: lambda.Code.fromAsset("lambda"), // code loaded from "lambda" directory
      handler: "addDataSuccess.handler",
    });

    // creating steps for the step function

    const addDataInvoke = new stepFunctionTasks.LambdaInvoke(
      this,
      "Invoke addData lambda",
      {
        lambdaFunction: addData,
      }
    );

    const addDataFailedInvoke = new stepFunctionTasks.LambdaInvoke(this, "No", {
      lambdaFunction: addDataFailed,
    });

    const addDataSuccessInvoke = new stepFunctionTasks.LambdaInvoke(
      this,
      "Yes",
      {
        lambdaFunction: addDataSuccess,
      }
    );

    const otherwisePass = new stepFunctions.Pass(this, "Otherwise", {
      result: stepFunctions.Result.fromObject({
        message: "Otherwise Executed",
      }),
      resultPath: "$.output.otherwise",
    });

    const afterwardsPass = new stepFunctions.Pass(this, "Afterwards", {
      result: stepFunctions.Result.fromObject({
        message: "Afterwards Executed",
      }),
      resultPath: "$.output.afterwards",
    });

    // Here we are putting a condition to choose our next state.

    //If the last state (addData) returns {operationSuccessful: true}
    // then we execute "addDataSuccess".

    // If the last state (addData) returns {operationSuccessful: false}
    // then we execute "addDataFailed"

    const choice = new stepFunctions.Choice(this, "operation successful?");
    choice.when(
      stepFunctions.Condition.booleanEquals(
        "$.Payload.operationSuccessful",
        true
      ),
      addDataSuccessInvoke
    );
    choice.when(
      stepFunctions.Condition.booleanEquals(
        "$.Payload.operationSuccessful",
        false
      ),
      addDataFailedInvoke
    );

    // If the last state (addData) returns neither {operationSuccessful: true} nor {operationSuccessful: false}
    // then the "otherwisePass" executes. In this application this never happens. You can change the return value of the "addData"
    // lambda function to test this state

    choice.otherwise(otherwisePass);

    // this always runs after the choice operation

    choice.afterwards().next(afterwardsPass);

    // creating chain to define the sequence of execution

    const chain = stepFunctions.Chain.start(addDataInvoke).next(choice);

    // create a state machine

    new stepFunctions.StateMachine(this, "choiceStateMachine", {
      definition: chain,
    });
  }
}
