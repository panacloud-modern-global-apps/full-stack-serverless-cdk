#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step01FineGrainedTestingStack } from '../lib/step01_fine_grained_testing-stack';

const app = new cdk.App();
new Step01FineGrainedTestingStack(app, 'Step01FineGrainedTestingStack');
