import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as StepxxAppsyncDynamodbAsDatasource from '../lib/stepxx_appsync_dynamodb_as_datasource-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new StepxxAppsyncDynamodbAsDatasource.StepxxAppsyncDynamodbAsDatasourceStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
