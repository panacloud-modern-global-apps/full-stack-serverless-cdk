#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step00XRayWithLambdaStack } from '../lib/step00_x-ray_with_lambda-stack';

const app = new cdk.App();
new Step00XRayWithLambdaStack(app, 'Step00XRayWithLambdaStack');
