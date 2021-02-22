import * as cdk from '@aws-cdk/core';
import cloudwatch = require('@aws-cdk/aws-cloudwatch');
import lambda = require('@aws-cdk/aws-lambda');
import * as cw_actions from '@aws-cdk/aws-cloudwatch-actions';
import sns = require('@aws-cdk/aws-sns');
import { SnsAction } from '@aws-cdk/aws-cloudwatch-actions';
import * as subscriptions from "@aws-cdk/aws-sns-subscriptions";

export class Step03AlarmsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);



    const lambdaFn = new lambda.Function(this, 'LambdaHandler', {
      runtime: lambda.Runtime.PYTHON_3_6,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'lambda.handler',
    });

    const errors = lambdaFn.metricErrors();
    const invocations = lambdaFn.metricInvocations();
    const throttle = lambdaFn.metricThrottles();




    const allProblems = new cloudwatch.MathExpression({
      expression: "errors + throttles",
      usingMetrics: {
        errors: errors,
        throttles: throttle
      }
    })


    const problemPercentage = new cloudwatch.MathExpression({
      expression: "(problems / invocations) * 100",
      usingMetrics: {
        problems: allProblems,
        invocations: invocations
      },
      period: cdk.Duration.minutes(1),
    })


    const Topic = new sns.Topic(this, 'Topic');

    Topic.addSubscription(
      new subscriptions.EmailSubscription("waris.hasan00@gmail.com")
    );

    const alarm = new cloudwatch.Alarm(this, 'Alarm', {
      metric: problemPercentage,
      threshold: 10,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
      evaluationPeriods: 1,
    });

    alarm.addAlarmAction(new SnsAction(Topic))





  }
}
