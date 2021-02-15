#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step01SimpleExtensionStack } from '../lib/step01_simple_extension-stack';

const app = new cdk.App();
new Step01SimpleExtensionStack(app, 'Step01SimpleExtensionStack');
