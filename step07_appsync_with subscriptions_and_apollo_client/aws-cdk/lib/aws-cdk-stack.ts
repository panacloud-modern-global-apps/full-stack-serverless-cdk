import * as cdk from '@aws-cdk/core';
import { CfnApiKey, MappingTemplate, GraphqlApi, PrimaryKey, Values, Schema, FieldLogLevel } from '@aws-cdk/aws-appsync';
import { AttributeType, Table } from '@aws-cdk/aws-dynamodb';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import { join } from 'path';

export class AwsCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    ////////////////  deploy webstie  //////////////////////////////////

    // create a s3 bucket 
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true
    })
    // create a cloudfront distribution 
    const distribution = new cloudfront.Distribution(this, 'myDist', {
      defaultBehavior: { origin: new origins.S3Origin(websiteBucket), }
    });
    // log domain name
    new cdk.CfnOutput(this, "DistributionDomainName", {
      value: `https://${distribution.domainName}`,
    })
    // create s3 deployment bucket
    const websiteDeployment = new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset(join('__dirname', '/../../', 'gatsby-client/public'))],
      destinationBucket: websiteBucket,
      distribution: distribution
    })

    //////////////////////// deploying appsync graphql backend ////////////////////////////////

    // Create a new AppSync GraphQL API
    const api = new GraphqlApi(this, 'Api', {
      name: `todosapi`,
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
      },
      schema: new Schema({ filePath: join('__dirname', '/../', 'schema/schema.graphql') }),
    });

    // Create new DynamoDB Table for Todos
    const todosTable = new Table(this, 'TodosTable', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
    });

    // Add todos DynamoDB as a Datasource for the Graphql API.
    const todosDS = api.addDynamoDbDataSource('Todos', todosTable);

    // Query Resolver to get all todos
    todosDS.createResolver({
      typeName: 'Query',
      fieldName: 'getTodos',
      requestMappingTemplate: MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: MappingTemplate.dynamoDbResultList(),
    });

    // Mutation Resolver for adding a new Todo
    todosDS.createResolver({
      typeName: 'Mutation',
      fieldName: 'addTodo',
      requestMappingTemplate: MappingTemplate.dynamoDbPutItem(
        PrimaryKey.partition('id').auto(), // this will auto generate the item's ID
        Values.projecting('todo')),
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    });

    // Mutation Resolver for deleting an exisiting Todo
    todosDS.createResolver({
      typeName: 'Mutation',
      fieldName: 'deleteTodo',
      requestMappingTemplate: MappingTemplate.dynamoDbDeleteItem('id', 'id'),
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    });

    // Mutation Resolver for updating an exisiting Todo
    todosDS.createResolver({
      typeName: 'Mutation',
      fieldName: 'updateTodo',
      requestMappingTemplate: MappingTemplate.dynamoDbPutItem(
        PrimaryKey.partition('id').is('id'),
        Values.projecting('todo')),
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    });

    //logging GraphQL API Endpoint
    new cdk.CfnOutput(this, 'Endpoint', {
      value: api.graphqlUrl
    });
    //logging GraphQL API Key
    new cdk.CfnOutput(this, 'API_Key', {
      value: api.apiKey || '',
    });
    //logging GraphQL API ID
    new cdk.CfnOutput(this, 'API_ID', {
      value: api.apiId || '',
    });

  }
}
