#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Example00CreateAutoSecretStack } from '../lib/example00_create_auto_secret-stack';

const app = new cdk.App();
new Example00CreateAutoSecretStack(app, 'Example00CreateAutoSecretStack');
