import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as WafWithCustomRules from '../lib/waf-with-custom-rules-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new WafWithCustomRules.WafWithCustomRulesStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
