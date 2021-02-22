#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step03AlarmsStack } from '../lib/step03_alarms-stack';

const app = new cdk.App();
new Step03AlarmsStack(app, 'Step03AlarmsStack');
