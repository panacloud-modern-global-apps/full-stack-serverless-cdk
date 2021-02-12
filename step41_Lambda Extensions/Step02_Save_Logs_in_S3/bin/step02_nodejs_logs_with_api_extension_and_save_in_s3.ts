#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step02NodejsLogsWithApiExtensionAndSaveInS3Stack } from '../lib/step02_nodejs_logs_with_api_extension_and_save_in_s3-stack';

const app = new cdk.App();
new Step02NodejsLogsWithApiExtensionAndSaveInS3Stack(app, 'Step02NodejsLogsWithApiExtensionAndSaveInS3Stack');
