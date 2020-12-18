#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { StepxxLambdaEdgeStack } from '../lib/stepxx_lambda_edge-stack';

const app = new cdk.App();
new StepxxLambdaEdgeStack(app, 'StepxxLambdaEdgeStack', {
    env: {
        region: 'us-east-1',
    },
});
