#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { StepxxAppsyncDynamodbDatasourceVtlStack } from '../lib/stepxx_appsync_dynamodb_datasource_vtl-stack';

const app = new cdk.App();
new StepxxAppsyncDynamodbDatasourceVtlStack(app, 'StepxxAppsyncDynamodbDatasourceVtlStack');
