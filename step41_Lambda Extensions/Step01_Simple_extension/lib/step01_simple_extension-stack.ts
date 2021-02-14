import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as path from "path";
export class Step01SimpleExtensionStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //========================================
    // Lambda Layer that will be used as Extension
    //========================================
    const lambdaLayer = new lambda.LayerVersion(this, "ext-layer", {
      code: lambda.Code.fromAsset("lambda-layers"),
    });

    //========================================
    // Lambda Func
    //========================================

    const sendfunc = new lambda.Function(this, "sendlog", {
      code: lambda.Code.fromAsset("lambda"),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "hello.handler",
      memorySize: 1024,
      layers: [lambdaLayer],
    });
  }
}
