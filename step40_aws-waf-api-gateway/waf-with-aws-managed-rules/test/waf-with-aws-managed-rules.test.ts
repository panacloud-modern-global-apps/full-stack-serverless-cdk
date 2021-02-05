import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as WafWithAwsManagedRules from '../lib/waf-with-aws-managed-rules-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new WafWithAwsManagedRules.WafWithAwsManagedRulesStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
