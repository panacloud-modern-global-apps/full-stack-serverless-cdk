#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step02CloudwatchDashboardStack } from '../lib/step02_cloudwatch_dashboard-stack';

const app = new cdk.App();
new Step02CloudwatchDashboardStack(app, 'Step02CloudwatchDashboardStack');
