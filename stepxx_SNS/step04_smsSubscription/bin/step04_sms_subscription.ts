#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step04SmsSubscriptionStack } from '../lib/step04_sms_subscription-stack';

const app = new cdk.App();
new Step04SmsSubscriptionStack(app, 'Step04SmsSubscriptionStack');
