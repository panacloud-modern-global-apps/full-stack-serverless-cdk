import * as cdk from '@aws-cdk/core';
import { Effect, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import * as appsync from '@aws-cdk/aws-appsync';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';

export class StepxxGrantIamPolicyToResourcesStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const api = new appsync.GraphqlApi(this, "GRAPHQL_API", {
      name: 'cdk-api',
      schema: appsync.Schema.fromAsset('graphql/schema.gql'),       ///Path specified for lambda
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,     ///Defining Authorization Type
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365))   ///set expiration for API Key
          }
        },
      },
      xrayEnabled: true                                             ///Enables xray debugging
    })

    ///Print Graphql Api Url on console after deploy
    new cdk.CfnOutput(this, "APIGraphQlURL", {
      value: api.graphqlUrl
    })

    ///Print API Key on console after deploy
    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || ''
    });


    ///Defining a DynamoDB Table
    const dynamoDBTable = new ddb.Table(this, 'Table', {
      partitionKey: {
        name: 'id',
        type: ddb.AttributeType.STRING,
      },
    });

    ///create a specific role for Lambda function
    const role = new Role(this, 'LambdaRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    });

    ///Attaching DynamoDb access to policy
    const policy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['dynamodb:*', "logs:*"],
      resources: ['*']
    });

    //granting IAM permissions to role
    role.addToPolicy(policy);

    ///Lambda Fucntion
    const lambda_function = new lambda.Function(this, "LambdaFucntion", {
      runtime: lambda.Runtime.NODEJS_12_X,            ///set nodejs runtime environment
      code: lambda.Code.fromAsset("lambda"),          ///path for lambda function directory
      handler: 'index.handler',                       ///specfic fucntion in specific file
      timeout: cdk.Duration.seconds(10),              ///Time for function to break. limit upto 15 mins
      role: role,                                     ///Defining role to Lambda
      environment : {                                 ///Setting Environment Variables
        "TABLE": dynamoDBTable.tableName
      },
    })

    const lambda_data_source = api.addLambdaDataSource("LamdaDataSource", lambda_function);

    ///Resolver mapping template reference for Lambda is also being used in it it will customize the way you want the data in your lambda function
    ////NOTE: No need to write response Mapping Template for it if you also want to customize the response then you can write response Mapping Template.
    lambda_data_source.createResolver({
      typeName: "Mutation",
      fieldName: "createData",
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
          $util.qr($context.arguments.put("id", $util.defaultIfNull($ctx.arguments.id, $util.autoId())))
        {
          "version": "2017-02-28",
          "operation": "Invoke",
          "payload": {
              "arguments": $util.toJson($context.arguments)
          }
        }
      `)
    })

  }
}
