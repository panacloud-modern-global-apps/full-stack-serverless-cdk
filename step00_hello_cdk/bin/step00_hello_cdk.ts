#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step00HelloCdkStack } from '../lib/step00_hello_cdk-stack';

const app = new cdk.App();
new Step00HelloCdkStack(app, 'Step00HelloCdkStack');
