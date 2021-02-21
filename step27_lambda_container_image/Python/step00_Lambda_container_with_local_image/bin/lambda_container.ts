#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { LambdaContainerStack } from '../lib/lambda_container-stack';

const app = new cdk.App();
new LambdaContainerStack(app, 'LambdaContainerStack');
