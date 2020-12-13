import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as iam from "@aws-cdk/aws-iam";

export class Step02CoreConceptsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    ///create a specific role for Lambda function
    const role = new iam.Role(this, "LambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    ///Attaching s3 read only access to policy
    const policy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["s3:Get*", "s3:List*"],
      resources: ["*"],
    });

    //granting IAM permissions to role
    role.addToPolicy(policy);

    new lambda.Function(this, "lambda-s3-x-ray-tracing", {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "app.handler",
      // Enabling X-Ray Tracing
      tracing: lambda.Tracing.ACTIVE,
      role: role,
    });
  }
}
