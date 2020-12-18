#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { StepxxRoute53Stack } from '../lib/stepxx_route53-stack';

const app = new cdk.App();
new StepxxRoute53Stack(app, 'StepxxRoute53Stack');
