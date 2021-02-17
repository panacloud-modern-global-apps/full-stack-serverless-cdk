import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";

export class Step00SimpleLambdaTracingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    new lambda.Function(this, "lambda-x-ray-tracing", {
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.fromAsset("lambda"),
      handler: "app.handler",
      // Enabling X-Ray Tracing
      tracing: lambda.Tracing.ACTIVE,
    });
  }
}
