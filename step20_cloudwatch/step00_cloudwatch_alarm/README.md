# How to Set a cloudwatch alarm using CDK

In this step you will learn how to set a cloudwatch alarm usi CDK.

### Step 1: Setup a CDK directory
`cdk init app --language typescript`

### Step2: Install following dependencies

`npm i @aws-cdk/aws-apigatewayv2`

`npm i @aws-cdk/aws-apigatewayv2-integrations`

`npm i @aws-cdk/aws-cloudwatch`

`npm i @aws-cdk/aws-lambda`

### Step3: Setup Lambda function
Create a new folder as **lambda** in the cdk root dir and add a file as **lambda.ts**.
```javascript
// lambda-fns/lambda.ts

const { DynamoDB, Lambda } = require('aws-sdk');

exports.handler = async function (event: any) {
    console.log("request:", JSON.stringify(event, undefined, 2));

    // create AWS SDK clients
    const dynamo = new DynamoDB();

    // update dynamo entry for "path" with hits++
    await dynamo.updateItem({
        TableName: process.env.HITS_TABLE_NAME,
        Key: { path: { S: event.rawPath } },
        UpdateExpression: 'ADD hits :incr',
        ExpressionAttributeValues: { ':incr': { N: '1' } }
    }).promise();

    console.log('inserted counter for ' + event.rawPath);

    // return response back to upstream caller
    return sendRes(200, 'You have connected with the Lambda!');
};

const sendRes = (status: number, body: string) => {
    var response = {
        statusCode: status,
        headers: {
            "Content-Type": "text/html"
        },
        body: body
    };
    return response;
};
```
### Step4: Setup Your Api Gateway,Lambda and DynamoDB
```javascript
// lib/step00_cloudwatch_alarm-stack.ts.ts

import * as cdk from '@aws-cdk/core';
import lambda = require('@aws-cdk/aws-lambda');
import dynamodb = require('@aws-cdk/aws-dynamodb');
import apigw = require('@aws-cdk/aws-apigatewayv2');
import integrations = require('@aws-cdk/aws-apigatewayv2-integrations');

export class Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

     // DynamoDB Table
    const table = new dynamodb.Table(this, 'Hits', {
      partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST
    });

    // Lambda to interact with DynamoDB
    const dynamoLambda = new lambda.Function(this, 'DynamoLambdaHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'lambda.handler',
      environment: {
        HITS_TABLE_NAME: table.tableName
      }
    });

    // grant the lambda role read/write permissions to our table
    table.grantReadWriteData(dynamoLambda);

    // defines an API Gateway Http API resource backed by our "dynamoLambda" function.
    let api = new apigw.HttpApi(this, 'HttpAPI', {
      defaultIntegration: new integrations.LambdaProxyIntegration({
        handler: dynamoLambda
      })
    });

  }
}
```
### Step5: Add a Method to build Metric Object
Add the following snippet of code.This take metric name,namespace,dimensions and unit etc as input and returns a metric object.

```javascript

 private buildMetric(metricName: string, namespace: string, dimensions: any, unit: cloudwatch.Unit, label: string, stat = 'avg', period = 900): cloudwatch.Metric {
    return new cloudwatch.Metric({
      metricName,
      namespace: namespace,
      dimensions: dimensions,
      unit: unit,
      label: label,
      statistic: stat,
      period: cdk.Duration.seconds(period)
    });

```

