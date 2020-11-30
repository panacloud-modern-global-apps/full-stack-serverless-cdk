import * as cdk from "@aws-cdk/core";
import * as appSync from "@aws-cdk/aws-appsync";

export class Step10AppsyncNoDataSourceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new appSync.GraphqlApi(this, "noDataSourceAPI", {
      name: "noDataSourceAPI",
      logConfig: {
        fieldLogLevel: appSync.FieldLogLevel.ALL,
      },
      schema: appSync.Schema.fromAsset("graphql/schema.graphql"),
    });

    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: api.graphqlUrl,
    });

    const dataSource = api.addNoneDataSource("noDataSource", {
      name: "noDataSource",
      description: "Does not save incoming data anywhere",
    });

    dataSource.createResolver({
      typeName: "Mutation",
      fieldName: "changeStatus",
      requestMappingTemplate: appSync.MappingTemplate.fromString(`{
        "version" : "2017-02-28",
        "payload": $util.toJson($context.arguments)
        }`),
      responseMappingTemplate: appSync.MappingTemplate.fromString(
        "$util.toJson($context.result)"
      ),
    });
  }
}
