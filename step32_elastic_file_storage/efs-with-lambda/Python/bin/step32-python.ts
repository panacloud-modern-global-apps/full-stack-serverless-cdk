#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step32PythonStack } from '../lib/step32-python-stack';

const app = new cdk.App();
new Step32PythonStack(app, 'Step32PythonStack');
