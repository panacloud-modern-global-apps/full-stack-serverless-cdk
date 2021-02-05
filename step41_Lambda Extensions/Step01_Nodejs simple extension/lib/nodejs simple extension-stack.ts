import * as cdk from '@aws-cdk/core';
import * as lambda from "@aws-cdk/aws-lambda";
import * as path from "path";
export class NodejsSimpleExtensionStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaLayer = new lambda.LayerVersion(this, "asd", {
      code: lambda.Code.fromAsset("lambda-layers"),

    });
    const sendfunc = new lambda.Function(this, "sendlog", {
      code: lambda.Code.fromAsset("lambda"),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "hello.handler",
      memorySize: 1024,
      layers: [lambdaLayer],
    });
  }
}
