import * as cdk from "@aws-cdk/core";
import * as pinpoint from "@aws-cdk/aws-pinpoint";
import * as appsync from "@aws-cdk/aws-appsync";
import * as lambda from "@aws-cdk/aws-lambda";
import { PolicyStatement, Role, ServicePrincipal } from "@aws-cdk/aws-iam";

export class PinPointStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    ///create a specific role for Lambda function
    const role = new Role(this, "LambdaRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    });

    // Attaching Pinpoint to policy
    role.addToPolicy(
      new PolicyStatement({
        actions: ["mobiletargeting:SendMessages", "logs:*"],
        resources: ["*"],
      })
    );

    //  Appsync Api
    const api = new appsync.GraphqlApi(this, "Api", {
      name: "Pinpoint-In-Pracitce",
      schema: appsync.Schema.fromAsset("graphql/schema.graphql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
      },
    });

    // Create a Pinpoint project
    const pinpointProject = new pinpoint.CfnApp(this, "project", {
      name: "PinpointInPractice",
    });

    //  Enable Email Channel to send emails
    const emailChannel = new pinpoint.CfnEmailChannel(this, "PinpointEmailCh", {
      applicationId: pinpointProject.ref,
      enabled: true,
      fromAddress: "utahir662@gmail.com",
      // The Amazon Resource Name (ARN) of the identity, verified with Amazon Simple Email Service (Amazon SES),
      // that you want to use when you send email through the channel.
      identity: pinpointProject.attrArn,
    });

    // lambda function
    const Lambda = new lambda.Function(this, "Pinpoint-In-Pracitce", {
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: "main.handler",
      role: role, ///Defining role to Lambda
      code: lambda.Code.fromAsset("lambda"),
      memorySize: 1024,
    });

    //  Adding lambda as a dataSource
    const lambdaDs = api.addLambdaDataSource("lambdaDataSource", Lambda);

    //  Creating Resolver
    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "createEmail",
    });

    new cdk.CfnOutput(this, "ProjectID", {
      value: pinpointProject.ref,
    });
  }
}
