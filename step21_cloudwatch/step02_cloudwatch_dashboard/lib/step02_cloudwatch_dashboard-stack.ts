import * as cdk from '@aws-cdk/core';
import lambda = require('@aws-cdk/aws-lambda');
import dynamodb = require('@aws-cdk/aws-dynamodb');
import apigw = require('@aws-cdk/aws-apigatewayv2');
import integrations = require('@aws-cdk/aws-apigatewayv2-integrations');
import cloudwatch = require('@aws-cdk/aws-cloudwatch');
import { GraphWidget, IMetric } from "@aws-cdk/aws-cloudwatch";

export class Step02CloudwatchDashboardStack extends cdk.Stack {
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



    /**
     * Custom Metrics
     */

    let apiGateway4xxErrorPercentage = new cloudwatch.MathExpression({
      expression: 'm1/m2*100',
      label: '% API Gateway 4xx Errors',
      usingMetrics: {
        m1: this.metricForApiGw(api.httpApiId, '4XXError', '4XX Errors', 'sum'),
        m2: this.metricForApiGw(api.httpApiId, 'Count', '# Requests', 'sum'),
      },
      period: cdk.Duration.minutes(5)
    });

    // Gather the % of lambda invocations that error in past 5 mins
    let dynamoLambdaErrorPercentage = new cloudwatch.MathExpression({
      expression: 'e / i * 100',
      label: '% of invocations that errored, last 5 mins',
      usingMetrics: {
        i: dynamoLambda.metric("Invocations", { statistic: 'sum' }),
        e: dynamoLambda.metric("Errors", { statistic: 'sum' }),
      },
      period: cdk.Duration.minutes(5)
    });

    // note: throttled requests are not counted in total num of invocations
    let dynamoLambdaThrottledPercentage = new cloudwatch.MathExpression({
      expression: 't / (i + t) * 100',
      label: '% of throttled requests, last 30 mins',
      usingMetrics: {
        i: dynamoLambda.metric("Invocations", { statistic: 'sum' }),
        t: dynamoLambda.metric("Throttles", { statistic: 'sum' }),
      },
      period: cdk.Duration.minutes(5)
    });

    // I think usererrors are at an account level rather than a table level so merging
    // these two metrics until I can get a definitive answer. I think usererrors
    // will always show as 0 when scoped to a table so this is still effectively
    // a system errors count
    let dynamoDBTotalErrors = new cloudwatch.MathExpression({
      expression: 'm1 + m2',
      label: 'DynamoDB Errors',
      usingMetrics: {
        m1: table.metricUserErrors(),
        m2: table.metricSystemErrorsForOperations(),
      },
      period: cdk.Duration.minutes(5)
    });

    // Rather than have 2 alerts, let's create one aggregate metric
    let dynamoDBThrottles = new cloudwatch.MathExpression({
      expression: 'm1 + m2',
      label: 'DynamoDB Throttles',
      usingMetrics: {
        m1: table.metric('ReadThrottleEvents', { statistic: 'sum' }),
        m2: table.metric('WriteThrottleEvents', { statistic: 'sum' }),
      },
      period: cdk.Duration.minutes(5)
    });


    /**
     * Custom Cloudwatch Dashboard 
     */

    new cloudwatch.Dashboard(this, 'CloudWatchDashBoard').addWidgets(
      this.buildGraphWidget('Requests', [
        this.metricForApiGw(api.httpApiId, 'Count', '# Requests', 'sum')
      ]),
      this.buildGraphWidget('API GW Latency', [
        this.metricForApiGw(api.httpApiId, 'Latency', 'API Latency p50', 'p50'),
        this.metricForApiGw(api.httpApiId, 'Latency', 'API Latency p90', 'p90'),
        this.metricForApiGw(api.httpApiId, 'Latency', 'API Latency p99', 'p99')
      ], true),
      this.buildGraphWidget('API GW Errors', [
        this.metricForApiGw(api.httpApiId, '4XXError', '4XX Errors', 'sum'),
        this.metricForApiGw(api.httpApiId, '5XXError', '5XX Errors', 'sum')
      ], true),
      this.buildGraphWidget('Dynamo Lambda Error %', [dynamoLambdaErrorPercentage]),
      this.buildGraphWidget('Dynamo Lambda Duration', [
        dynamoLambda.metricDuration({ statistic: "p50" }),
        dynamoLambda.metricDuration({ statistic: "p90" }),
        dynamoLambda.metricDuration({ statistic: "p99" })
      ], true),
      this.buildGraphWidget('Dynamo Lambda Throttle %', [dynamoLambdaThrottledPercentage]),
      this.buildGraphWidget('DynamoDB Latency', [
        table.metricSuccessfulRequestLatency({ dimensions: { "TableName": table.tableName, "Operation": "GetItem" } }),
        table.metricSuccessfulRequestLatency({ dimensions: { "TableName": table.tableName, "Operation": "UpdateItem" } }),
        table.metricSuccessfulRequestLatency({ dimensions: { "TableName": table.tableName, "Operation": "PutItem" } }),
        table.metricSuccessfulRequestLatency({ dimensions: { "TableName": table.tableName, "Operation": "DeleteItem" } }),
        table.metricSuccessfulRequestLatency({ dimensions: { "TableName": table.tableName, "Operation": "Query" } }),
      ], true),
      this.buildGraphWidget('DynamoDB Consumed Read/Write Units', [
        table.metric('ConsumedReadCapacityUnits'),
        table.metric('ConsumedWriteCapacityUnits')
      ], false),
      this.buildGraphWidget('DynamoDB Throttles', [
        table.metric('ReadThrottleEvents', { statistic: 'sum' }),
        table.metric('WriteThrottleEvents', { statistic: 'sum' })
      ], true)
    )

    new cdk.CfnOutput(this, 'HTTP API Url', {
      value: api.url ?? 'Something went wrong with the deploy'
    });
  }

  private buildGraphWidget(widgetName: string, metrics: IMetric[], stacked = false): GraphWidget {
    return new GraphWidget({
      title: widgetName,
      left: metrics,
      stacked: stacked,
      width: 8
    });
  }

  private metricForApiGw(apiId: string, metricName: string, label: string, stat = 'avg'): cloudwatch.Metric {
    let dimensions = {
      ApiId: apiId
    };
    return this.buildMetric(metricName, 'AWS/ApiGateway', dimensions, cloudwatch.Unit.COUNT, label, stat);
  }

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
  }
}
