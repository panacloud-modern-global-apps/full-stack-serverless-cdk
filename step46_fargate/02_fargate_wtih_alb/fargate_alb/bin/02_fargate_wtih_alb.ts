#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { FargateWtihAlbStack } from '../lib/02_fargate_wtih_alb-stack';

const app = new cdk.App();
new FargateWtihAlbStack(app, '02FargateWtihAlbStack');
