#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { StepxxBasicPipelineStack } from '../lib/stepxx_basic_pipeline-stack';

const app = new cdk.App();
new StepxxBasicPipelineStack(app, 'StepxxBasicPipelineStack');
