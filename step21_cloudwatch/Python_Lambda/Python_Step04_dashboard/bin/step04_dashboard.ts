#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step04DashboardStack } from '../lib/step04_dashboard-stack';

const app = new cdk.App();
new Step04DashboardStack(app, 'Step04DashboardStack');
