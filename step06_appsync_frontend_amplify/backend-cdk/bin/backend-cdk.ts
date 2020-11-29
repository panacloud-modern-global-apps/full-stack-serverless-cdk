#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { BackendCdkStack } from '../lib/backend-cdk-stack';

const app = new cdk.App();
new BackendCdkStack(app, 'BackendCdkStack',{env:{region:"us-east-1"}});
