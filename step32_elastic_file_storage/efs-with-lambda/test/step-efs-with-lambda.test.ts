import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as StepEfsWithLambda from '../lib/step-efs-with-lambda-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new StepEfsWithLambda.StepEfsWithLambdaStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
