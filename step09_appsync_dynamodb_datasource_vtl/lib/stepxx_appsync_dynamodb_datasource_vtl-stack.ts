import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as ddb from '@aws-cdk/aws-dynamodb';

export class StepxxAppsyncDynamodbDatasourceVtlStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here


    ///APPSYNC API gives you a graphql api with api key
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

    ///Attaching Datasource to api
    const db_data_source = api.addDynamoDbDataSource('DataSources', dynamoDBTable);


    db_data_source.createResolver({
      typeName: "Mutation",
      fieldName: "createNote",
      requestMappingTemplate : appsync.MappingTemplate.fromString(`
        ## Automatically set the id if it's not passed in.
        $util.qr($context.args.put("id", $util.defaultIfNull($ctx.args.id, $util.autoId())))
        {
          "version" : "2018-05-29",
          "operation": "PutItem",
          "key": {
            "id":   $util.dynamodb.toDynamoDBJson($ctx.args.id)
          },
          "attributeValues": $util.dynamodb.toMapValuesJson($context.args)
        }
      `),
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.error)
          $util.error($context.error.message, $context.error.type)
        #else
          $utils.toJson($context.result)
        #end
      `)
    })

    db_data_source.createResolver({
      typeName: "Query",
      fieldName: "notes",
      requestMappingTemplate : appsync.MappingTemplate.fromString(`
      {
        "version" : "2017-02-28",
        "operation" : "Scan"
      }
      `),
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.error)
          $util.error($context.error.message, $context.error.type)
        #else
          $utils.toJson($context.result.items)
        #end
      `)
    })


    db_data_source.createResolver({
      typeName: "Mutation",
      fieldName: "deleteNote",
      requestMappingTemplate : appsync.MappingTemplate.fromString(`
      {
        "version" : "2018-05-29",
        "operation" : "DeleteItem",
        "key" : {
            "id" : $util.dynamodb.toDynamoDBJson($ctx.args.id)
        }
      }
      `),
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.error)
          $util.error($context.error.message, $context.error.type)
        #else
          $utils.toJson($context.result)
        #end
      `)
    })


    db_data_source.createResolver({
      typeName: "Mutation",
      fieldName: "updateNote",
      requestMappingTemplate : appsync.MappingTemplate.fromString(`
      {
        "version" : "2018-05-29",
        "operation" : "UpdateItem",
        "key" : {
            "id" : $util.dynamodb.toDynamoDBJson($ctx.args.id)
        },
        "update" : {
          "expression" : "SET #title = :t",
          "expressionNames" : {
            "#title" : "title"
          },
          "expressionValues" : {
              ":t" : $util.dynamodb.toDynamoDBJson($ctx.args.title)
          }
        }
      }
      `),
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if( $context.error)
          $util.error($context.error.message, $context.error.type)
        #else
          $utils.toJson($context.result)
        #end
      `)
    })


  }
}
