import * as cdk from '@aws-cdk/core';
import * as timestream from '@aws-cdk/aws-timestream';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';
import * as apigateway from '@aws-cdk/aws-apigateway';

export class AwsTimestreamStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const TimeStreamDB = new timestream.CfnDatabase(this, 'TimeStreamDB', {
      databaseName: 'TimeStreamDB',
    });

    const DBTable = new timestream.CfnTable(this, 'TSTable', {
      tableName: 'TSTable',
      databaseName: TimeStreamDB.databaseName!,
    });

    const TSlambda = new lambda.Function(this, 'TSLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('lambda-fns'),
      handler: 'main.handler',
    });

    TSlambda.addEnvironment('TS_DATABASE_NAME', DBTable.databaseName);
    TSlambda.addEnvironment('TS_TABLE_NAME', DBTable.tableName!);

    const postStepsIntegration = new apigateway.LambdaIntegration(TSlambda);

    const api = new apigateway.RestApi(this, 'TSApi', {
      restApiName: 'TSApi',
      description: 'Testing TSDB',
    });

    api.root.addMethod('POST', postStepsIntegration);

    const policy = new iam.PolicyStatement();
    policy.addActions(
      'timestream:DescribeEndpoints',
      'timestream:WriteRecords'
    );
    policy.addResources('*');

    TSlambda.addToRolePolicy(policy)
  }
}
