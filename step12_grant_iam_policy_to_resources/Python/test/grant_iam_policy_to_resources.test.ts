import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as GrantIamPolicyToResources from '../lib/grant_iam_policy_to_resources-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new GrantIamPolicyToResources.GrantIamPolicyToResourcesStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
