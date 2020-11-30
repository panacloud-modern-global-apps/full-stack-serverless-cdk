#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step10AppsyncNoDataSourceStack } from '../lib/step10_appsync_no_data_source-stack';

const app = new cdk.App();
new Step10AppsyncNoDataSourceStack(app, 'Step10AppsyncNoDataSourceStack');
