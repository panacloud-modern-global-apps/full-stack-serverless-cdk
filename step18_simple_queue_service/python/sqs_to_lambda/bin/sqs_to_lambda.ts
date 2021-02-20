#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SqsToLambdaStack } from '../lib/sqs_to_lambda-stack';

const app = new cdk.App();
new SqsToLambdaStack(app, 'SqsToLambdaStack');
