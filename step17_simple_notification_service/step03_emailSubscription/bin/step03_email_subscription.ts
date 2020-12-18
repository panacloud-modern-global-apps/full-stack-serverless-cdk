#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step03EmailSubscriptionStack } from '../lib/step03_email_subscription-stack';

const app = new cdk.App();
new Step03EmailSubscriptionStack(app, 'Step03EmailSubscriptionStack');
