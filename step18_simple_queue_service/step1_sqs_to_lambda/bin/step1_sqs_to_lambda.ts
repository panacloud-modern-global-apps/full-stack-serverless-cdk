#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step1SqsToLambdaStack } from '../lib/step1_sqs_to_lambda-stack';

const app = new cdk.App();
new Step1SqsToLambdaStack(app, 'Step1SqsToLambdaStack');
