import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as PinPoint from '../lib/pin_point-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new PinPoint.PinPointStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
