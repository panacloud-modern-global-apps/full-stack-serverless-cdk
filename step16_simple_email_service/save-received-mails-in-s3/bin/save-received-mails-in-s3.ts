#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SaveReceivedMailsInS3Stack } from '../lib/save-received-mails-in-s3-stack';

const app = new cdk.App();
new SaveReceivedMailsInS3Stack(app, 'SaveReceivedMailsInS3Stack');
