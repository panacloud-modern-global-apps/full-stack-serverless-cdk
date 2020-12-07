import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as events from "@aws-cdk/aws-events";
import * as appsync from "@aws-cdk/aws-appsync";
import targets = require("@aws-cdk/aws-events-targets");
import * as ddb from "@aws-cdk/aws-dynamodb";
import * as stepFunctions from "@aws-cdk/aws-stepfunctions";
import * as stepFunctionTasks from "@aws-cdk/aws-stepfunctions-tasks";

export class Step06InvokeStepFunctionWithEventStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // API
    const api = new appsync.GraphqlApi(this, "Api", {
      name: "appsyncEventbridgeAPI",
      schema: appsync.Schema.fromAsset("schema/schema.graphql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
      },
      logConfig: { fieldLogLevel: appsync.FieldLogLevel.ALL },
      xrayEnabled: true,
    });

    // HTTP DATASOURCE
    const httpDs = api.addHttpDataSource(
      "ds",
      "https://events." + this.region + ".amazonaws.com/", // This is the ENDPOINT for eventbridge.
      {
        name: "httpDsWithEventBridge",
        description: "From Appsync to Eventbridge",
        authorizationConfig: {
          signingRegion: this.region,
          signingServiceName: "events",
        },
      }
    );
    events.EventBus.grantPutEvents(httpDs);

    // RESOLVER
    const putEventResolver = httpDs.createResolver({
      typeName: "Mutation",
      fieldName: "createEvent",
      requestMappingTemplate: appsync.MappingTemplate.fromFile("request.vtl"),
      responseMappingTemplate: appsync.MappingTemplate.fromFile("response.vtl"),
    });

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

    const firstStep = new stepFunctionTasks.LambdaInvoke(
      this,
      "Invoke addData lambda",
      {
        lambdaFunction: addData,
      }
    );

    // pass state

    const pass = new stepFunctions.Pass(this, "Pass", {
      result: stepFunctions.Result.fromObject({ triggerTime: 2 }),
      resultPath: "$.passObject",
    });

    // wait state

    const wait = new stepFunctions.Wait(this, "Wait For Trigger Time", {
      time: stepFunctions.WaitTime.secondsPath("$.passObject.triggerTime"),
    });

    // Reaching a Succeed state terminates the state machine execution with a succesful status.

    const success = new stepFunctions.Succeed(this, "Job Successful");

    // Reaching a Fail state terminates the state machine execution with a failure status.

    const jobFailed = new stepFunctions.Fail(this, "Job Failed", {
      cause: "Lambda Job Failed",
      error: "could not add data to the dynamoDb",
    });

    // choice state

    const choice = new stepFunctions.Choice(this, "operation successful?");
    choice.when(
      stepFunctions.Condition.booleanEquals(
        "$.Payload.operationSuccessful",
        true
      ),
      success
    );
    choice.when(
      stepFunctions.Condition.booleanEquals(
        "$.Payload.operationSuccessful",
        false
      ),
      jobFailed
    );

    // creating chain to define the sequence of execution

    const chain = stepFunctions.Chain.start(firstStep)
      .next(pass)
      .next(wait)
      .next(choice);

    // create a state machine

    const stepFn = new stepFunctions.StateMachine(
      this,
      "stateMachineEventDriven",
      {
        definition: chain,
      }
    );

    // creating rule to invoke step function on event

    const rule = new events.Rule(this, "AppSyncStepFnRule", {
      eventPattern: {
        source: ["appsync-events"],
      },
    });

    rule.addTarget(new targets.SfnStateMachine(stepFn));
  }
}
