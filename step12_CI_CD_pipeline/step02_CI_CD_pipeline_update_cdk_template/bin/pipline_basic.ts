#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PiplineBasicStack } from '../lib/pipline_basic-stack';

const app = new cdk.App();
new PiplineBasicStack(app, 'PiplineBasicStack');
