#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { HelloLambdaWithPythonStack } from '../lib/hello_lambda_with_python-stack';

const app = new cdk.App();
new HelloLambdaWithPythonStack(app, 'HelloLambdaWithPythonStack');
