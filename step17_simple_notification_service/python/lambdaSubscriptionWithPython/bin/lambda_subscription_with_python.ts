#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { LambdaSubscriptionWithPythonStack } from '../lib/lambda_subscription_with_python-stack';

const app = new cdk.App();
new LambdaSubscriptionWithPythonStack(app, 'LambdaSubscriptionWithPythonStack');
