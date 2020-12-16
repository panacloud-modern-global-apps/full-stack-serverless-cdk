import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cloudfront from '@aws-cdk/aws-cloudfront'
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as s3 from '@aws-cdk/aws-s3'


export class StepxxLambdaEdgeStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const myFunc = new cloudfront.experimental.EdgeFunction(this, 'MyFunction', {
      runtime: lambda.Runtime.NODEJS_10_X,

      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
    });
    const myBucket = new s3.Bucket(this, 'myBucket');

    new cloudfront.Distribution(this, 'myDist', {

      defaultBehavior: {
        origin: new origins.S3Origin(myBucket),

        edgeLambdas: [
          {
            functionVersion: myFunc.currentVersion,
            eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
          }
        ],
      },
    });
  }
}
