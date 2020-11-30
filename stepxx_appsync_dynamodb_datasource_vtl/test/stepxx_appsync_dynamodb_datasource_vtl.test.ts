import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as StepxxAppsyncDynamodbDatasourceVtl from '../lib/stepxx_appsync_dynamodb_datasource_vtl-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new StepxxAppsyncDynamodbDatasourceVtl.StepxxAppsyncDynamodbDatasourceVtlStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
