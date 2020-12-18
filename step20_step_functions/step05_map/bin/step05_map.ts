#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step05MapStack } from '../lib/step05_map-stack';

const app = new cdk.App();
new Step05MapStack(app, 'Step05MapStack');
