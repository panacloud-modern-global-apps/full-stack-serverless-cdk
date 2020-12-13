#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { InvokeLambdaOnReceiveingMailStack } from '../lib/invoke-lambda-on-receiveing-mail-stack';

const app = new cdk.App();
new InvokeLambdaOnReceiveingMailStack(app, 'InvokeLambdaOnReceiveingMailStack');
