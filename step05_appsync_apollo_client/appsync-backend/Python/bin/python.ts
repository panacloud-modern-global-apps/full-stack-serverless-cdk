#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PythonStack } from '../lib/python-stack';

const app = new cdk.App();
new PythonStack(app, 'PythonStack');
