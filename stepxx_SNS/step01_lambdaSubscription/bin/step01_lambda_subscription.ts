#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step01LambdaSubscriptionStack } from '../lib/step01_lambda_subscription-stack';

const app = new cdk.App();
new Step01LambdaSubscriptionStack(app, 'Step01LambdaSubscriptionStack');
