import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as event from "@aws-cdk/aws-events";
import * as target  from "@aws-cdk/aws-events-targets";
import * as destinations from "@aws-cdk/aws-lambda-destinations";
import * as apigw from "@aws-cdk/aws-apigateway";
import * as subs from '@aws-cdk/aws-sns-subscriptions';
import * as sns from '@aws-cdk/aws-sns';
import * as iam from "@aws-cdk/aws-iam";

export class Example00LambdaDestinationEventBridgeStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
        // The code that defines your stack goes here
        const bus = new event.EventBus(this, "EventBus", {
          eventBusName: 'ExampleEventBus'
        })
    
        const myTopic = new sns.Topic(this, 'MyTopic');
    
        const destinedLambda = new lambda.Function(this, 'DestinationLambda', {
          runtime: lambda.Runtime.PYTHON_3_7,
          code: lambda.Code.fromAsset('lambda'),
          handler: 'destined.handler',
          retryAttempts: 0,
          onSuccess: new destinations.EventBridgeDestination(bus),
          onFailure: new destinations.EventBridgeDestination(bus)
        });
    
        myTopic.addSubscription(new subs.LambdaSubscription(destinedLambda));
    
        const mainLambda = new lambda.Function(this, 'mainLambda', {
          runtime: lambda.Runtime.PYTHON_3_7,
          code: lambda.Code.fromAsset('lambda'),
          handler: 'app.handler',
          environment: {
            TOPIC_ARN : myTopic.topicArn
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
    
        new cdk.CfnOutput(this, "EndpointURL", {
          value: api.url
        })
    
        const successLambda = new lambda.Function(this, 'SuccesserLambdaHandler', {
          runtime: lambda.Runtime.PYTHON_3_7,
          code: lambda.Code.fromAsset('lambda'),
          handler: 'success.handler'
        });
    
        const successRule = new event.Rule(this, 'successRule', {
          eventBus: bus,
          eventPattern:
          {
            "detail": {
              "responsePayload": {
                "source": ["event-success"],
                "action": ["data"]
              }
            }
          },
          targets : [
            new target.LambdaFunction(successLambda)
          ]
        });
    
        const failLambda = new lambda.Function(this, 'failureLambdaHandler', {
          runtime: lambda.Runtime.NODEJS_12_X,
          code: lambda.Code.fromAsset('lambda'),
          handler: 'fail.handler',
        });
    
        const failRule = new event.Rule(this, 'failRule', {
          eventBus: bus,
          eventPattern:
          {
            "detail": {
              "responsePayload": {
                "source": ["event-fail"],
                "action": ["data"]
              }
            }
          },
          targets : [
            new target.LambdaFunction(failLambda)
          ]
        });
  }
}
