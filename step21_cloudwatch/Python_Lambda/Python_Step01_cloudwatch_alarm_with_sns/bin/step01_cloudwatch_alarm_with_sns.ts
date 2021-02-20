#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step01PythonCWAlarmWithSnsStack } from '../lib/step01_cloudwatch_alarm_with_sns-stack';

const app = new cdk.App();
new Step01PythonCWAlarmWithSnsStack(app, 'Step01PythonCWAlarmWithSnsStack');
