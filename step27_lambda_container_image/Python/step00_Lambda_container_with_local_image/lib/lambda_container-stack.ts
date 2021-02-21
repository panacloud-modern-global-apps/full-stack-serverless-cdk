import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
const path = require("path");

export class LambdaContainerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // creating lambda with contianer image
    const fn = new lambda.DockerImageFunction(this, "lambdaFunction", {
      //make sure the lambdaImage folder must container Dockerfile
      code: lambda.DockerImageCode.fromImageAsset("lambdaImage"),
    });
  }
}
