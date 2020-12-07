#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step06InvokeStepFunctionWithEventStack } from '../lib/step06_invoke_step_function_with_event-stack';

const app = new cdk.App();
new Step06InvokeStepFunctionWithEventStack(app, 'Step06InvokeStepFunctionWithEventStack');
