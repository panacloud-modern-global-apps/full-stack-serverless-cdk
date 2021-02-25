#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { UserpoolWithLambdaStack } from '../lib/userpool_with_lambda-stack';

const app = new cdk.App();
new UserpoolWithLambdaStack(app, 'UserpoolWithLambdaStack');
