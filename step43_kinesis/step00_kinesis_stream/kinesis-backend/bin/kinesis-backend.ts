#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { KinesisBackendStack } from '../lib/kinesis-backend-stack';

const app = new cdk.App();
new KinesisBackendStack(app, 'KinesisBackendStack');
