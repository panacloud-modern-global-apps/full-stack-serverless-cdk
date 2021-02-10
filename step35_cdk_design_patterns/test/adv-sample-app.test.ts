import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as AdvSampleApp from '../lib/CDK-Design-Patterns-Stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new AdvSampleApp.AdvSampleAppStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
