#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Example04UserpoolWithIdentityPoolStack } from '../lib/example04_userpool_with_identity_pool-stack';

const app = new cdk.App();
new Example04UserpoolWithIdentityPoolStack(app, 'Example04UserpoolWithIdentityPoolStack');
