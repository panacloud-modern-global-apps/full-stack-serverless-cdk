#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step04AppsyncLambdaAsDatasourceStack } from '../lib/step04_appsync_lambda_as_datasource-stack';

const app = new cdk.App();
new Step04AppsyncLambdaAsDatasourceStack(app, 'Step04AppsyncLambdaAsDatasourceStack');
