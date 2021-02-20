#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsFargateStack } from '../lib/aws_fargate-stack';

const app = new cdk.App();
new AwsFargateStack(app, 'AwsFargateStack');
