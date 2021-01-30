import * as cdk from '@aws-cdk/core';
import cloudwatch = require('@aws-cdk/aws-cloudwatch');
import lambda = require('@aws-cdk/aws-lambda');
import sns = require('@aws-cdk/aws-sns');



export class Step04DashboardStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

 

    
    const lambdaFn = new lambda.Function(this, 'LambdaHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'lambda.handler',
    });

    const errors = lambdaFn.metricErrors({
      statistic: 'avg',
      period: cdk.Duration.minutes(1),
    });
    
    const duration = lambdaFn.metricDuration();
    

    const dash = new cloudwatch.Dashboard(this, "dash");

    const widget = new cloudwatch.GraphWidget({

      title: "Executions vs error rate",
    
      left: [errors],
      right: [duration],

      view: cloudwatch.GraphWidgetView.BAR,
      liveData: true
    })

    const textWidget = new cloudwatch.TextWidget({
      markdown: '# Key Performance Indicators'
    });

    dash.addWidgets(textWidget);
    dash.addWidgets(widget);
  


  }
}
