#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step0BasicExampleStack } from '../lib/step0_basic_example-stack';

const app = new cdk.App();
new Step0BasicExampleStack(app, 'Step0BasicExampleStack');
