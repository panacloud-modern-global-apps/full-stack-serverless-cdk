#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Example00SimpleLambdaTracingStack } from '../lib/example00_simple_lambda_tracing-stack';

const app = new cdk.App();
new Example00SimpleLambdaTracingStack(app, 'Example00SimpleLambdaTracingStack');
