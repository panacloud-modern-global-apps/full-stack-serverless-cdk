#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step00_Neptune_Lambda_Stack } from '../lib/step00_neptune_lambda';

const app = new cdk.App();
new Step00_Neptune_Lambda_Stack(app, 'Step00NeptuneLambdaStack');
