import * as cdk from "@aws-cdk/core";
import * as sam from "@aws-cdk/aws-sam";
import * as lambda from "@aws-cdk/aws-lambda";

export class LambdaPowerTuningStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // A lambda function to use to test the powertuner
    let exampleLambda = new lambda.Function(this, "lambdaHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromInline(
        'exports.handler = function(event, ctx, cb) {console.log("lambda power tuning"); return cb(null, "hi"); }'
      ),
      handler: "index.handler",
    });

    // Output the Lambda function ARN in the deploy logs to ease testing
    new cdk.CfnOutput(this, "LambdaARN", {
      value: exampleLambda.functionArn,
    });

    // Deploy the aws-lambda-powertuning application from the Serverless Application Repository
    // This will enable you to visualize cost and performance of lambda and help you decide best configuration according to cost or performance
    new sam.CfnApplication(this, "powerTuner", {
      location: {
        applicationId:
          "arn:aws:serverlessrepo:us-east-1:451282441545:applications/aws-lambda-power-tuning",
        semanticVersion: "3.4.0",
      },
      parameters: {
        lambdaResource: "*",
        PowerValues: "128,256,512,1024,1536,3008",
      },
    });
    // You can restrict the scope of the lambda power tuner by stricting it to the specific lambda function by providing lambdaResource as below
    //lambdaResource = exampleLambda.functionArn;
  }
}
