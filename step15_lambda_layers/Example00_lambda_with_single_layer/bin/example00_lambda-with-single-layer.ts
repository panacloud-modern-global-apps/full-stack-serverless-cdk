#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { example00LambdaWithSingleLayerStack } from '../lib/example00_lambda-with-single-layer-stack';

const app = new cdk.App();
new example00LambdaWithSingleLayerStack(app, 'Example00LambdaWithSingleLayerStack');
