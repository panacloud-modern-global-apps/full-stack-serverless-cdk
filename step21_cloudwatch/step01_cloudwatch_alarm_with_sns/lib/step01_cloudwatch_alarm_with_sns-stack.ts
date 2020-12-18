import * as cdk from '@aws-cdk/core';
import lambda = require('@aws-cdk/aws-lambda');
import dynamodb = require('@aws-cdk/aws-dynamodb');
import apigw = require('@aws-cdk/aws-apigatewayv2');
import integrations = require('@aws-cdk/aws-apigatewayv2-integrations');
import cloudwatch = require('@aws-cdk/aws-cloudwatch');
import * as subscriptions from '@aws-cdk/aws-sns-subscriptions';
import { SnsAction } from '@aws-cdk/aws-cloudwatch-actions';
import sns = require('@aws-cdk/aws-sns');

export class Step01CloudwatchAlarmWithSnsStack extends cdk.Stack {
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

    const errorTopic = new sns.Topic(this, 'errorTopic');
    errorTopic.addSubscription(
      new subscriptions.EmailSubscription('xyz@email.com'),
    );
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


    /**
     * Alarms
     */

    // API Gateway

    // 4xx are user errors so a large volume indicates a problem
    new cloudwatch.Alarm(this, 'API Gateway 4XX Errors > 1%', {
      metric: apiGateway4xxErrorPercentage,
      threshold: 1,
      evaluationPeriods: 6,
      datapointsToAlarm: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    }).addAlarmAction(new SnsAction(errorTopic));

    // 5xx are internal server errors so we want 0 of these
    new cloudwatch.Alarm(this, 'API Gateway 5XX Errors > 0', {
      metric: this.metricForApiGw(api.httpApiId, '5XXError', '5XX Errors', 'p99'),
      threshold: 0,
      period: cdk.Duration.minutes(5),
      evaluationPeriods: 6,
      datapointsToAlarm: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    }).addAlarmAction(new SnsAction(errorTopic));

    new cloudwatch.Alarm(this, 'API p99 latency alarm >= 1s', {
      metric: this.metricForApiGw(api.httpApiId, 'Latency', 'API GW Latency', 'p99'),
      threshold: 1000,
      period: cdk.Duration.minutes(5),
      evaluationPeriods: 6,
      datapointsToAlarm: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    }).addAlarmAction(new SnsAction(errorTopic));

    // Lambda

    // 2% of Dynamo Lambda invocations erroring

    // 1% of Lambda invocations taking longer than 1 second
    new cloudwatch.Alarm(this, 'Dynamo Lambda p99 Long Duration (>1s)', {
      metric: dynamoLambda.metricDuration(),
      period: cdk.Duration.minutes(5),
      threshold: 1000,
      evaluationPeriods: 6,
      datapointsToAlarm: 1,
      statistic: "p99",
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    }).addAlarmAction(new SnsAction(errorTopic));


    new cdk.CfnOutput(this, 'HTTP API Url', {
      value: api.url ?? 'Something went wrong with the deploy'
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
