#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { StepxxCiCdPipelineUpdateFrontendStack } from '../lib/stepxx_ci_cd_pipeline_update_frontend-stack';

const app = new cdk.App();
new StepxxCiCdPipelineUpdateFrontendStack(app, 'StepxxCiCdPipelineUpdateFrontendStack');
