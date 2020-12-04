#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step04ParallelStack } from '../lib/step04_parallel-stack';

const app = new cdk.App();
new Step04ParallelStack(app, 'Step04ParallelStack');
