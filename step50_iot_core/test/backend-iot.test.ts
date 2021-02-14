import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as BackendIot from '../lib/backend-iot-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new BackendIot.BackendIotStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
