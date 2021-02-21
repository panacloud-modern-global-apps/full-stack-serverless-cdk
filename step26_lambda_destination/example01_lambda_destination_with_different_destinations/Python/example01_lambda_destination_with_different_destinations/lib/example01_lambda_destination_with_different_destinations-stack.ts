import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as event from "@aws-cdk/aws-events";
import * as target  from "@aws-cdk/aws-events-targets";
import * as destinations from "@aws-cdk/aws-lambda-destinations";
import * as apigw from "@aws-cdk/aws-apigateway";
import * as subs from '@aws-cdk/aws-sns-subscriptions';
import * as sns from '@aws-cdk/aws-sns';
import * as iam from "@aws-cdk/aws-iam";

export class Example01LambdaDestinationWithDifferentDestinationsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const myTopic = new sns.Topic(this, 'MySubTopic');                  ////SNS Topic define
    const lambdainvokeTopic = new sns.Topic(this, 'lambdainvokeTopic');

    const failLambda = new lambda.Function(this, 'failureLambdaHandler', {      ////Failure Lambda
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'fail.handler',
    });

    const destinedLambda = new lambda.Function(this, 'DestinationLambda', {       ///Destination Lambda
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'destined.handler',
      retryAttempts: 1,                                                           ///if fail it will retry again
      onSuccess: new destinations.SnsDestination(myTopic),                        ///ONSUCCESS of lambda
      onFailure: new destinations.LambdaDestination(failLambda)                   ///ONFailure of lambda
    });

    lambdainvokeTopic.addSubscription(new subs.LambdaSubscription(destinedLambda));


    myTopic.addSubscription(new subs.EmailSubscription("your_email@example.com"))    ///Subscibe topic to your event

    const mainLambda = new lambda.Function(this, 'mainLambda', {
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'app.handler',
      environment: {
        TOPIC_ARN : lambdainvokeTopic.topicArn
      }
    });

    mainLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["sns:*"],
        resources: ["*"]
      })
    );

    const api = new apigw.LambdaRestApi(this, "Endpoint", {
      handler: mainLambda,
    });

  }
}
