import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Example01LambdaDestinationWithDifferentDestinations from '../lib/example01_lambda_destination_with_different_destinations-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Example01LambdaDestinationWithDifferentDestinations.Example01LambdaDestinationWithDifferentDestinationsStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
