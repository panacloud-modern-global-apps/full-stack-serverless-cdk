#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { StepxxAppsyncDynamodbAsDatasourceStack } from '../lib/stepxx_appsync_dynamodb_as_datasource-stack';

const app = new cdk.App();
new StepxxAppsyncDynamodbAsDatasourceStack(app, 'StepxxAppsyncDynamodbAsDatasourceStack');
