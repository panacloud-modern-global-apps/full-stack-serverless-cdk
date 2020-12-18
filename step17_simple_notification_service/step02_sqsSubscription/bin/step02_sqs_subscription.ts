#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step02SqsSubscriptionStack } from '../lib/step02_sqs_subscription-stack';

const app = new cdk.App();
new Step02SqsSubscriptionStack(app, 'Step02SqsSubscriptionStack');
