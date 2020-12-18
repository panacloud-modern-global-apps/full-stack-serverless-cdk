# How to Set a cloudwatch alarm using CDK

This step will add a cloudwatch alarm on a mertic.You can view an alarm in AWS cloudwatch alarm pannel after deploying the code.

>![Cloudwatch Alarm](img/cloudwatchAlarm.png)  



# Code Explanation

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
Add the following snippet of code.This take metric name,namespace,dimensions and unit etc as input and returns a metric object.Metric objects represent a metric that is emitted by AWS services or your own application, such as CPUUsage, FailureCount or Bandwidth.

```javascript

 private buildMetric(metricName: string, namespace: string, dimensions: any, unit: cloudwatch.Unit, label: string, stat = 'avg', period = 900): cloudwatch.Metric {
    return new cloudwatch.Metric({
      metricName, //Name of this metric.
      namespace: namespace, //Namespace of this metric.
      dimensions: dimensions, //Dimensions of this metric.
      unit: unit, //Unit of the metric.
      label: label, //Label for this metric when added to a Graph in a Dashboard.
      statistic: stat, //Statistic of this metric.
      period: cdk.Duration.seconds(period) //Aggregation period of this metric.
    });

```
### Step6: Add a Method to call buildMetric
Add the following snippet of code.This take metricName,apiId and label as input and calls buildMetric.

```javascript

private metricForApiGw(apiId: string, metricName: string, label: string, stat = 'avg'): cloudwatch.Metric {
    let dimensions = {
      ApiId: apiId
    };
    return this.buildMetric(metricName, 'AWS/ApiGateway', dimensions, cloudwatch.Unit.COUNT, label, stat);
  }


```
### Step7: Add a Math Expression
Add the following snippet of code.We will do metric math here.Metric math enables you to query multiple CloudWatch metrics and use math expressions to create new time series based on these metrics. You can visualize the resulting time series on the CloudWatch console and add them to dashboards. Using AWS Lambda metrics as an example, you could divide the Errors metric by the Invocations metric to get an error rate. Then add the resulting time series to a graph on your CloudWatch dashboard.

```javascript

 let apiGateway4xxErrorPercentage = new cloudwatch.MathExpression({
      expression: 'm1/m2*100', //The expression defining the metric.
      label: '% API Gateway 4xx Errors', Label for this metric when added to a Graph.
      usingMetrics: {
        m1: this.metricForApiGw(api.httpApiId, '4XXError', '4XX Errors', 'sum'),
        m2: this.metricForApiGw(api.httpApiId, 'Count', '# Requests', 'sum'),
      }, //The metrics used in the expression
      period: cdk.Duration.minutes(5) //Aggregation period of this metric.
    });

```

### Step8: Add an Alarm
Add the following snippet of code.This will add an alarm on apiGateway4xxErrorPercentage metric.

```javascript

 new cloudwatch.Alarm(this, 'API Gateway 4XX Errors > 1%', {
      metric: apiGateway4xxErrorPercentage, //The metric to add the alarm on.
      threshold: 1, //The value against which the specified statistic is compared.
      evaluationPeriods: 6, //The number of periods over which data is compared to the specified threshold.
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING //Sets how this alarm is to handle missing data points.
    })

```

