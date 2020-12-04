#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step01SetupBasicPipelineStack } from '../lib/step01_setup_basic_pipeline-stack';

const app = new cdk.App();
new Step01SetupBasicPipelineStack(app, 'Step01SetupBasicPipelineStack');
