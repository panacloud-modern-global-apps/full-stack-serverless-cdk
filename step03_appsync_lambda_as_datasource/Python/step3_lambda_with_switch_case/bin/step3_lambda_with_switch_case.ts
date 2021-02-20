#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step3LambdaWithSwitchCaseStack } from '../lib/step3_lambda_with_switch_case-stack';

const app = new cdk.App();
new Step3LambdaWithSwitchCaseStack(app, 'Step3LambdaWithSwitchCaseStack');
