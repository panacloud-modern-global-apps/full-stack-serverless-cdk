#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step25LambdaEdgeStack } from '../lib/step25_lambda_edge-stack';

const app = new cdk.App();
new Step25LambdaEdgeStack(app, 'Step25LambdaEdgeStack');
