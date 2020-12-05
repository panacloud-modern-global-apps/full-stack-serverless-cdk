#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Example01UserpoolWithLambdaTriggerStack } from '../lib/example01_userpool_with_lambda_trigger-stack';

const app = new cdk.App();
new Example01UserpoolWithLambdaTriggerStack(app, 'Example01UserpoolWithLambdaTriggerStack');
