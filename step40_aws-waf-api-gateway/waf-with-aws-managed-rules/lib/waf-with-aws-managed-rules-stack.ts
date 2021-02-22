import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigw from "@aws-cdk/aws-apigateway";
import * as waf from "@aws-cdk/aws-wafv2";

export class WafWithAwsManagedRulesStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const wafLambda = new lambda.Function(this, "WAFLambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda"),
    });

    const api = new apigw.LambdaRestApi(this, "LambdaAPI", {
      handler: wafLambda,
    });

    const webACL = new waf.CfnWebACL(this, "APIGatewayWafSample", {
      defaultAction: { allow: {} },
      rules: [
        {
          // When you have a single rule
          // This rule blocks IP which request more than 100 times within 5 minutes of duration
          name: "LimitRequests100",
          priority: 1,
          action: {
            block: {},
          },
          statement: {
            rateBasedStatement: {
              limit: 100,
              aggregateKeyType: "IP",
            },
          },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: "LimitRequests100",
          },
        },
        {
          // WHen you have list of rules in a group
          priority: 2, // Set priority of rule or group of rules
          overrideAction: { none: {} },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: "AWS-AWSManagedRulesAmazonIpReputationList",
          },
          name: "AWS-AWSManagedRulesAmazonIpReputationList",
          statement: {
            managedRuleGroupStatement: {
              vendorName: "AWS",
              name: "AWSManagedRulesAmazonIpReputationList",
            },
          },
        },
      ],
      scope: "REGIONAL",
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: "web-acl",
      },
    });

    const arn = `arn:aws:apigateway:${this.region}::/restapis/${api.restApiId}/stages/${api.deploymentStage.stageName}`;

    const wafAssoc = new waf.CfnWebACLAssociation(this, "WafAssociation", {
      webAclArn: webACL.attrArn,
      resourceArn: arn,
    });
  }
}
