#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { NodejsSimpleExtensionStack } from '../lib/nodejs simple extension-stack';

const app = new cdk.App();
new NodejsSimpleExtensionStack(app, 'NodejsSimpleExtensionStack');
