#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Example01LambdaWithMultipleLayersStack } from '../lib/example01_lambda_with_multiple_layers-stack';

const app = new cdk.App();
new Example01LambdaWithMultipleLayersStack(app, 'Example01LambdaWithMultipleLayersStack');
