import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as ContainerLambdasEcr from '../lib/container-lambdas-ecr-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new ContainerLambdasEcr.ContainerLambdasEcrStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
