"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepxxAppsyncDynamodbAsDatasourceStack = void 0;
const cdk = require("@aws-cdk/core");
const appsync = require("@aws-cdk/aws-appsync");
const ddb = require("@aws-cdk/aws-dynamodb");
class StepxxAppsyncDynamodbAsDatasourceStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // The code that defines your stack goes here
        ///APPSYNC API gives you a graphql api with api key
        const api = new appsync.GraphqlApi(this, "GRAPHQL_API", {
            name: 'cdk-api',
            schema: appsync.Schema.fromAsset('graphql/schema.gql'),
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: appsync.AuthorizationType.API_KEY,
                    apiKeyConfig: {
                        expires: cdk.Expiration.after(cdk.Duration.days(365)) ///set expiration for API Key
                    }
                },
            },
            xrayEnabled: true ///Enables xray debugging
        });
        ///Print Graphql Api Url on console after deploy
        new cdk.CfnOutput(this, "APIGraphQlURL", {
            value: api.graphqlUrl
        });
        ///Print API Key on console after deploy
        new cdk.CfnOutput(this, "GraphQLAPIKey", {
            value: api.apiKey || ''
        });
        ///Defining a DynamoDB Table
        const dynoTable = new ddb.Table(this, 'Table', {
            partitionKey: {
                name: 'id',
                type: ddb.AttributeType.STRING,
            },
        });
        const db_data_source = api.addDynamoDbDataSource('DataSources', dynoTable);
        db_data_source.createResolver({
            typeName: "Mutation",
            fieldName: "createNote",
            requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(appsync.PrimaryKey.partition('id').auto(), ///Create an autoID for your primary Key Id
            appsync.Values.projecting() ///Add Remaining input values
            ),
            responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem() ////Mapping template for a single result item from DynamoDB.
        });
        db_data_source.createResolver({
            typeName: "Query",
            fieldName: "notes",
            requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
            responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
        });
        db_data_source.createResolver({
            typeName: "Mutation",
            fieldName: "deleteNote",
            requestMappingTemplate: appsync.MappingTemplate.dynamoDbDeleteItem('id', 'id'),
            responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem() ////Mapping template for a single result item from DynamoDB.
        });
        db_data_source.createResolver({
            typeName: "Mutation",
            fieldName: "updateNote",
            requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(///Mapping template to save a single item to a DynamoDB table.
            appsync.PrimaryKey.partition('id').is('id'), ///Where id is input ID
            appsync.Values.projecting()),
            responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem() ////Mapping template for a single result item from DynamoDB.
        });
    }
}
exports.StepxxAppsyncDynamodbAsDatasourceStack = StepxxAppsyncDynamodbAsDatasourceStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlcHh4X2FwcHN5bmNfZHluYW1vZGJfYXNfZGF0YXNvdXJjZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN0ZXB4eF9hcHBzeW5jX2R5bmFtb2RiX2FzX2RhdGFzb3VyY2Utc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUNBQXFDO0FBQ3JDLGdEQUFnRDtBQUNoRCw2Q0FBNkM7QUFFN0MsTUFBYSxzQ0FBdUMsU0FBUSxHQUFHLENBQUMsS0FBSztJQUNuRSxZQUFZLEtBQW9CLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQ2xFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLDZDQUE2QztRQUU3QyxtREFBbUQ7UUFDbkQsTUFBTSxHQUFHLEdBQUcsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDdEQsSUFBSSxFQUFFLFNBQVM7WUFDZixNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUM7WUFDdEQsbUJBQW1CLEVBQUU7Z0JBQ25CLG9CQUFvQixFQUFFO29CQUNwQixpQkFBaUIsRUFBRSxPQUFPLENBQUMsaUJBQWlCLENBQUMsT0FBTztvQkFDcEQsWUFBWSxFQUFFO3dCQUNaLE9BQU8sRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFHLDZCQUE2QjtxQkFDdEY7aUJBQ0Y7YUFDRjtZQUNELFdBQVcsRUFBRSxJQUFJLENBQTZDLHlCQUF5QjtTQUN4RixDQUFDLENBQUE7UUFFRixnREFBZ0Q7UUFDaEQsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDdkMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxVQUFVO1NBQ3RCLENBQUMsQ0FBQTtRQUVGLHdDQUF3QztRQUN4QyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUN2QyxLQUFLLEVBQUUsR0FBRyxDQUFDLE1BQU0sSUFBSSxFQUFFO1NBQ3hCLENBQUMsQ0FBQztRQUdILDRCQUE0QjtRQUM1QixNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRTtZQUM3QyxZQUFZLEVBQUU7Z0JBQ1osSUFBSSxFQUFFLElBQUk7Z0JBQ1YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTTthQUMvQjtTQUNGLENBQUMsQ0FBQztRQUVILE1BQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFM0UsY0FBYyxDQUFDLGNBQWMsQ0FBQztZQUM1QixRQUFRLEVBQUUsVUFBVTtZQUNwQixTQUFTLEVBQUUsWUFBWTtZQUN2QixzQkFBc0IsRUFBRyxPQUFPLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FDOUQsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQVMsMkNBQTJDO1lBQzdGLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQXVCLDZCQUE2QjthQUNoRjtZQUNDLHVCQUF1QixFQUFFLE9BQU8sQ0FBQyxlQUFlLENBQUMsa0JBQWtCLEVBQUUsQ0FBRyw0REFBNEQ7U0FDdkksQ0FBQyxDQUFBO1FBRUYsY0FBYyxDQUFDLGNBQWMsQ0FBQztZQUM1QixRQUFRLEVBQUUsT0FBTztZQUNqQixTQUFTLEVBQUUsT0FBTztZQUNsQixzQkFBc0IsRUFBRSxPQUFPLENBQUMsZUFBZSxDQUFDLGlCQUFpQixFQUFFO1lBQ25FLHVCQUF1QixFQUFFLE9BQU8sQ0FBQyxlQUFlLENBQUMsa0JBQWtCLEVBQUU7U0FDdEUsQ0FBQyxDQUFBO1FBRUYsY0FBYyxDQUFDLGNBQWMsQ0FBQztZQUM1QixRQUFRLEVBQUUsVUFBVTtZQUNwQixTQUFTLEVBQUUsWUFBWTtZQUN2QixzQkFBc0IsRUFBRSxPQUFPLENBQUMsZUFBZSxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUM7WUFDOUUsdUJBQXVCLEVBQUUsT0FBTyxDQUFDLGVBQWUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFhLDREQUE0RDtTQUMvSSxDQUFDLENBQUM7UUFFSCxjQUFjLENBQUMsY0FBYyxDQUFDO1lBQzVCLFFBQVEsRUFBRSxVQUFVO1lBQ3BCLFNBQVMsRUFBRSxZQUFZO1lBQ3ZCLHNCQUFzQixFQUFFLE9BQU8sQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFpQiw4REFBOEQ7WUFDNUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFtQyx1QkFBdUI7WUFDckcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUM5Qix1QkFBdUIsRUFBRSxPQUFPLENBQUMsZUFBZSxDQUFDLGtCQUFrQixFQUFFLENBQUssNERBQTREO1NBQ3ZJLENBQUMsQ0FBQztJQUlMLENBQUM7Q0FDRjtBQTlFRCx3RkE4RUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnQGF3cy1jZGsvY29yZSc7XG5pbXBvcnQgKiBhcyBhcHBzeW5jIGZyb20gJ0Bhd3MtY2RrL2F3cy1hcHBzeW5jJztcbmltcG9ydCAqIGFzIGRkYiBmcm9tICdAYXdzLWNkay9hd3MtZHluYW1vZGInO1xuXG5leHBvcnQgY2xhc3MgU3RlcHh4QXBwc3luY0R5bmFtb2RiQXNEYXRhc291cmNlU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkNvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gVGhlIGNvZGUgdGhhdCBkZWZpbmVzIHlvdXIgc3RhY2sgZ29lcyBoZXJlXG5cbiAgICAvLy9BUFBTWU5DIEFQSSBnaXZlcyB5b3UgYSBncmFwaHFsIGFwaSB3aXRoIGFwaSBrZXlcbiAgICBjb25zdCBhcGkgPSBuZXcgYXBwc3luYy5HcmFwaHFsQXBpKHRoaXMsIFwiR1JBUEhRTF9BUElcIiwge1xuICAgICAgbmFtZTogJ2Nkay1hcGknLFxuICAgICAgc2NoZW1hOiBhcHBzeW5jLlNjaGVtYS5mcm9tQXNzZXQoJ2dyYXBocWwvc2NoZW1hLmdxbCcpLCAgICAgICAvLy9QYXRoIHNwZWNpZmllZCBmb3IgbGFtYmRhXG4gICAgICBhdXRob3JpemF0aW9uQ29uZmlnOiB7XG4gICAgICAgIGRlZmF1bHRBdXRob3JpemF0aW9uOiB7XG4gICAgICAgICAgYXV0aG9yaXphdGlvblR5cGU6IGFwcHN5bmMuQXV0aG9yaXphdGlvblR5cGUuQVBJX0tFWSwgICAgIC8vL0RlZmluaW5nIEF1dGhvcml6YXRpb24gVHlwZVxuICAgICAgICAgIGFwaUtleUNvbmZpZzoge1xuICAgICAgICAgICAgZXhwaXJlczogY2RrLkV4cGlyYXRpb24uYWZ0ZXIoY2RrLkR1cmF0aW9uLmRheXMoMzY1KSkgICAvLy9zZXQgZXhwaXJhdGlvbiBmb3IgQVBJIEtleVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB4cmF5RW5hYmxlZDogdHJ1ZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vL0VuYWJsZXMgeHJheSBkZWJ1Z2dpbmdcbiAgICB9KVxuXG4gICAgLy8vUHJpbnQgR3JhcGhxbCBBcGkgVXJsIG9uIGNvbnNvbGUgYWZ0ZXIgZGVwbG95XG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJBUElHcmFwaFFsVVJMXCIsIHtcbiAgICAgIHZhbHVlOiBhcGkuZ3JhcGhxbFVybFxuICAgIH0pXG5cbiAgICAvLy9QcmludCBBUEkgS2V5IG9uIGNvbnNvbGUgYWZ0ZXIgZGVwbG95XG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJHcmFwaFFMQVBJS2V5XCIsIHtcbiAgICAgIHZhbHVlOiBhcGkuYXBpS2V5IHx8ICcnXG4gICAgfSk7XG5cblxuICAgIC8vL0RlZmluaW5nIGEgRHluYW1vREIgVGFibGVcbiAgICBjb25zdCBkeW5vVGFibGUgPSBuZXcgZGRiLlRhYmxlKHRoaXMsICdUYWJsZScsIHtcbiAgICAgIHBhcnRpdGlvbktleToge1xuICAgICAgICBuYW1lOiAnaWQnLFxuICAgICAgICB0eXBlOiBkZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgZGJfZGF0YV9zb3VyY2UgPSBhcGkuYWRkRHluYW1vRGJEYXRhU291cmNlKCdEYXRhU291cmNlcycsIGR5bm9UYWJsZSk7XG5cbiAgICBkYl9kYXRhX3NvdXJjZS5jcmVhdGVSZXNvbHZlcih7XG4gICAgICB0eXBlTmFtZTogXCJNdXRhdGlvblwiLFxuICAgICAgZmllbGROYW1lOiBcImNyZWF0ZU5vdGVcIixcbiAgICAgIHJlcXVlc3RNYXBwaW5nVGVtcGxhdGUgOiBhcHBzeW5jLk1hcHBpbmdUZW1wbGF0ZS5keW5hbW9EYlB1dEl0ZW0oXG4gICAgICAgIGFwcHN5bmMuUHJpbWFyeUtleS5wYXJ0aXRpb24oJ2lkJykuYXV0bygpLCAgICAgICAgLy8vQ3JlYXRlIGFuIGF1dG9JRCBmb3IgeW91ciBwcmltYXJ5IEtleSBJZFxuICAgICAgICBhcHBzeW5jLlZhbHVlcy5wcm9qZWN0aW5nKCkgICAgICAgICAgICAgICAgICAgICAgIC8vL0FkZCBSZW1haW5pbmcgaW5wdXQgdmFsdWVzXG4gICAgICApLFxuICAgICAgICByZXNwb25zZU1hcHBpbmdUZW1wbGF0ZTogYXBwc3luYy5NYXBwaW5nVGVtcGxhdGUuZHluYW1vRGJSZXN1bHRJdGVtKCkgICAvLy8vTWFwcGluZyB0ZW1wbGF0ZSBmb3IgYSBzaW5nbGUgcmVzdWx0IGl0ZW0gZnJvbSBEeW5hbW9EQi5cbiAgICB9KVxuXG4gICAgZGJfZGF0YV9zb3VyY2UuY3JlYXRlUmVzb2x2ZXIoe1xuICAgICAgdHlwZU5hbWU6IFwiUXVlcnlcIixcbiAgICAgIGZpZWxkTmFtZTogXCJub3Rlc1wiLFxuICAgICAgcmVxdWVzdE1hcHBpbmdUZW1wbGF0ZTogYXBwc3luYy5NYXBwaW5nVGVtcGxhdGUuZHluYW1vRGJTY2FuVGFibGUoKSwgICAgICAvLy9NYXBwaW5nIHRlbXBsYXRlIHRvIHNjYW4gYSBEeW5hbW9EQiB0YWJsZSB0byBmZXRjaCBhbGwgZW50cmllcy5cbiAgICAgIHJlc3BvbnNlTWFwcGluZ1RlbXBsYXRlOiBhcHBzeW5jLk1hcHBpbmdUZW1wbGF0ZS5keW5hbW9EYlJlc3VsdExpc3QoKSwgICAgLy8vL01hcHBpbmcgdGVtcGxhdGUgZm9yIGEgcmVzdWx0IGxpc3QgZnJvbSBEeW5hbW9EQi5cbiAgICB9KVxuXG4gICAgZGJfZGF0YV9zb3VyY2UuY3JlYXRlUmVzb2x2ZXIoe1xuICAgICAgdHlwZU5hbWU6IFwiTXV0YXRpb25cIixcbiAgICAgIGZpZWxkTmFtZTogXCJkZWxldGVOb3RlXCIsXG4gICAgICByZXF1ZXN0TWFwcGluZ1RlbXBsYXRlOiBhcHBzeW5jLk1hcHBpbmdUZW1wbGF0ZS5keW5hbW9EYkRlbGV0ZUl0ZW0oJ2lkJywgJ2lkJyksICAgLy8vTWFwcGluZyB0ZW1wbGF0ZSB0byBkZWxldGUgYSBzaW5nbGUgaXRlbSBmcm9tIGEgRHluYW1vREIgdGFibGUuXG4gICAgICByZXNwb25zZU1hcHBpbmdUZW1wbGF0ZTogYXBwc3luYy5NYXBwaW5nVGVtcGxhdGUuZHluYW1vRGJSZXN1bHRJdGVtKCkgICAgICAgICAgICAgLy8vL01hcHBpbmcgdGVtcGxhdGUgZm9yIGEgc2luZ2xlIHJlc3VsdCBpdGVtIGZyb20gRHluYW1vREIuXG4gICAgfSk7XG5cbiAgICBkYl9kYXRhX3NvdXJjZS5jcmVhdGVSZXNvbHZlcih7XG4gICAgICB0eXBlTmFtZTogXCJNdXRhdGlvblwiLFxuICAgICAgZmllbGROYW1lOiBcInVwZGF0ZU5vdGVcIixcbiAgICAgIHJlcXVlc3RNYXBwaW5nVGVtcGxhdGU6IGFwcHN5bmMuTWFwcGluZ1RlbXBsYXRlLmR5bmFtb0RiUHV0SXRlbSggICAgICAgICAgICAgICAgLy8vTWFwcGluZyB0ZW1wbGF0ZSB0byBzYXZlIGEgc2luZ2xlIGl0ZW0gdG8gYSBEeW5hbW9EQiB0YWJsZS5cbiAgICAgICAgYXBwc3luYy5QcmltYXJ5S2V5LnBhcnRpdGlvbignaWQnKS5pcygnaWQnKSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vV2hlcmUgaWQgaXMgaW5wdXQgSURcbiAgICAgICAgYXBwc3luYy5WYWx1ZXMucHJvamVjdGluZygpKSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vQWRkIFJlbWFpbmluZyBpbnB1dCB2YWx1ZXNcbiAgICAgIHJlc3BvbnNlTWFwcGluZ1RlbXBsYXRlOiBhcHBzeW5jLk1hcHBpbmdUZW1wbGF0ZS5keW5hbW9EYlJlc3VsdEl0ZW0oKSAgICAgLy8vL01hcHBpbmcgdGVtcGxhdGUgZm9yIGEgc2luZ2xlIHJlc3VsdCBpdGVtIGZyb20gRHluYW1vREIuXG4gICAgfSk7XG5cblxuXG4gIH1cbn1cbiJdfQ==