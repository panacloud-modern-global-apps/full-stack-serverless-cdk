#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { NeptuneStack } from '../lib/neptune-stack';

const app = new cdk.App();
new NeptuneStack(app, 'NeptuneStack');
