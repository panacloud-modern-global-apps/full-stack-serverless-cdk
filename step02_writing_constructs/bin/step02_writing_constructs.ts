#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step02WritingConstructsStack } from '../lib/step02_writing_constructs-stack';

const app = new cdk.App();
new Step02WritingConstructsStack(app, 'Step02WritingConstructsStack');
