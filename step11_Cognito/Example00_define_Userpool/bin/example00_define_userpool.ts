#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Example00DefineUserpoolStack } from '../lib/example00_define_userpool-stack';

const app = new cdk.App();
new Example00DefineUserpoolStack(app, 'Example00DefineUserpoolStack');
