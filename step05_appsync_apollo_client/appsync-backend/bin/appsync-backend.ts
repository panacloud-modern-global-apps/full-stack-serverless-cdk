#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AppsyncBackendStack } from '../lib/appsync-backend-stack';

const app = new cdk.App();
new AppsyncBackendStack(app, 'AppsyncBackendStack');
