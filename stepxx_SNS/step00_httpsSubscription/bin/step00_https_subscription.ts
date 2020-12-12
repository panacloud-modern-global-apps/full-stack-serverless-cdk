#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step00HttpsSubscriptionStack } from '../lib/step00_https_subscription-stack';

const app = new cdk.App();
new Step00HttpsSubscriptionStack(app, 'Step00HttpsSubscriptionStack');
