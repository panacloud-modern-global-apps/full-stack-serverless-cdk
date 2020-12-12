import * as cdk from "@aws-cdk/core";
import * as sns from "@aws-cdk/aws-sns";
import * as subscriptions from "@aws-cdk/aws-sns-subscriptions";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigw from "@aws-cdk/aws-apigateway";
import { SubscriptionProtocol } from "@aws-cdk/aws-sns";

export class Step00HttpsSubscriptionStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create a lambda function
    const hello = new lambda.Function(this, "HelloHandler", {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "hello.handler",
    });

    // create an endpoint for the lambda function
    const api = new apigw.LambdaRestApi(this, "Endpoint", {
      handler: hello,
    });

    // create an SNS topic
    const myTopic = new sns.Topic(this, "MyTopic");

    // The following command subscribes our endpoint(connected to lambda) to the SNS topic
    myTopic.addSubscription(
      new subscriptions.UrlSubscription(api.url, {
        protocol: SubscriptionProtocol.HTTPS
      })
    );
  }
}
