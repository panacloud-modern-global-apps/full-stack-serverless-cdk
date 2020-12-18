#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step01PassWaitStack } from '../lib/step01_pass_wait-stack';

const app = new cdk.App();
new Step01PassWaitStack(app, 'Step01PassWaitStack');
