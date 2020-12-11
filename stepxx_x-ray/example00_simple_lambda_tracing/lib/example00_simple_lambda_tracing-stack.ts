import * as cdk from '@aws-cdk/core';
import * as lambda from "@aws-cdk/aws-lambda";

export class Example00SimpleLambdaTracingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    new lambda.Function(this, "lambda-x-ray-Demo", {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "app.handler",
      // Enabling X-Ray Tracing
      tracing: lambda.Tracing.ACTIVE,
    });
  }
}
