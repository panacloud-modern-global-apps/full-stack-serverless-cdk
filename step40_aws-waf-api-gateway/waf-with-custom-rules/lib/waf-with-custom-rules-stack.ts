import * as cdk from "@aws-cdk/core";
import * as waf from "@aws-cdk/aws-wafv2";
import * as apigw from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";

export class WafWithCustomRulesStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const wafLambda = new lambda.Function(this, "WAFLambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda"),
    });

    const api = new apigw.LambdaRestApi(this, "LambdaAPI", {
      handler: wafLambda,
    });

    // ===========================================================================================
    // Defining Custom Rules
    // ===========================================================================================

    const customRules = new waf.CfnRuleGroup(this, "WAFCustomRule", {
      name: "WAFCustomRule",
      description: "This is a custom rule created for waf",
      capacity: 1000,
      scope: "REGIONAL",
      rules: [
        {
          priority: 1,
          name: "RULE1",
          action: {
            allow: {},
          },
          statement: {
            geoMatchStatement: {
              countryCodes: ["PK"],
              forwardedIpConfig: {
                headerName: "X-Forwarded-For",
                fallbackBehavior: "MATCH",
              },
            },
          },
          visibilityConfig: {
            metricName: "RULE1",
            cloudWatchMetricsEnabled: true,
            sampledRequestsEnabled: true,
          },
        },
      ],
      visibilityConfig: {
        metricName: "WEBACL_RULE",
        cloudWatchMetricsEnabled: true,
        sampledRequestsEnabled: true,
      },
    });

    const webACL = new waf.CfnWebACL(this, "WafACLRUle", {
      defaultAction: { allow: {} },
      rules: [
        {
          // WHen you have list of rules in a group
          priority: 1,
          overrideAction: { none: {} },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: "ACLRULE",
          },
          name: "ACLRULE",
          statement: {
            ruleGroupReferenceStatement: {
              arn: customRules.attrArn,
            },
          },
        },
      ],
      scope: "REGIONAL",
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: "WAFCustomRule",
      },
    });

    const arn = `arn:aws:apigateway:${this.region}::/restapis/${api.restApiId}/stages/${api.deploymentStage.stageName}`;

    const webAssoc = new waf.CfnWebACLAssociation(this, "WafAssociation", {
      webAclArn: webACL.attrArn,
      resourceArn: arn,
    });
  }
}
