#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { StepEfsWithLambdaStack } from '../lib/step-efs-with-lambda-stack';

const app = new cdk.App();
new StepEfsWithLambdaStack(app, 'StepEfsWithLambdaStack');
