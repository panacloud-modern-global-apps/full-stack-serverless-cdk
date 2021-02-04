#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { LambdaPowerTuningStack } from '../lib/lambda_power_tuning-stack';

const app = new cdk.App();
new LambdaPowerTuningStack(app, 'LambdaPowerTuningStack');
