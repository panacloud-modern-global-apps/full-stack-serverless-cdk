#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step00SimpleStepFunctionStack } from '../lib/step00_simple_step_function-stack';

const app = new cdk.App();
new Step00SimpleStepFunctionStack(app, 'Step00SimpleStepFunctionStack');
