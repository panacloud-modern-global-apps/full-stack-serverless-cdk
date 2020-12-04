import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';

export class example00LambdaWithSingleLayerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const lambdaLayer = new lambda.LayerVersion(this, "LambdaLayer", {
      code: lambda.Code.fromAsset('lambda-layer'),
    })

    new lambda.Function(this, 'LambdaWithLambdaLayer', {
      runtime: lambda.Runtime.NODEJS_12_X, // execution environment
      code: lambda.Code.fromAsset('lambda-fns'),  // code loaded from the "lambda" directory
      handler: 'lambda.handler',  // file is "lambda", function is "handler"
      layers: [lambdaLayer]
    })

  }
}
