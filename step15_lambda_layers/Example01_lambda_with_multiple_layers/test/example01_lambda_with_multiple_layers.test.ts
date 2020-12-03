import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Example01LambdaWithMultipleLayers from '../lib/example01_lambda_with_multiple_layers-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Example01LambdaWithMultipleLayers.Example01LambdaWithMultipleLayersStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
