import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Back from '../lib/backStacka';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Back.BackStacka(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
