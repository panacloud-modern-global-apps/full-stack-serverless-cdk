#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step02SaveLogsInS3Stack } from '../lib/step02_save_logs_in_s3-stack';

const app = new cdk.App();
new Step02SaveLogsInS3Stack(app, 'Step02SaveLogsInS3Stack');
