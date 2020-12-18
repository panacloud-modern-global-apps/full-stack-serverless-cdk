#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step00CloudwatchAlarmStack } from '../lib/step00_cloudwatch_alarm-stack';

const app = new cdk.App();
new Step00CloudwatchAlarmStack(app, 'Step00CloudwatchAlarmStack');
