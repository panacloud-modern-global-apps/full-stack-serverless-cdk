import * as cdk from '@aws-cdk/core';
import * as lambda from "@aws-cdk/aws-lambda";
import * as s3 from "@aws-cdk/aws-s3";
import * as iam from "@aws-cdk/aws-iam";
export class Step02SaveLogsInS3Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

//========================================
    // S3 bucket where logs will br saved
    //========================================

    const bucket = new s3.Bucket(this, "DemoBucket");
    //========================================
    // Lambda Layer that will be used as Extension
    //========================================
    const lambdaLayer = new lambda.LayerVersion(this, "lambdalayer", {
      code: lambda.Code.fromAsset("lambda-layers"),
    });

    //========================================
    // Permessions
    //========================================

    const role = new iam.Role(this, "Role", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });
    const policy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["s3:*"],
      resources: ["*"],
    });
    role.addToPolicy(policy);

    //========================================
    // Lambda Func
    //=======================================

    const sendfunc = new lambda.Function(this, "sendlog", {
      code: lambda.Code.fromAsset("lambda"),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "hello.handler",
      memorySize: 1024,
      layers: [lambdaLayer],
      role: role,
      environment: {
        S3_BUCKET_NAME: bucket.bucketName,
      },
    });  }
}
