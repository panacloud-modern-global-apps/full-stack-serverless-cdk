#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step04AppsyncDynamodbStack } from '../lib/step04_appsync_dynamodb-stack';

const app = new cdk.App();
new Step04AppsyncDynamodbStack(app, 'Step04AppsyncDynamodbStack');
