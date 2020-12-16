import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as StepxxRoute53 from '../lib/stepxx_route53-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new StepxxRoute53.StepxxRoute53Stack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
