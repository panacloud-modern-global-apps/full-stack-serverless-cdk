import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Neptune from '../lib/neptune-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Neptune.NeptuneStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
