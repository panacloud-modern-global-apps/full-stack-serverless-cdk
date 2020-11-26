#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step03HelloAppsyncStack } from '../lib/step03_hello_appsync-stack';

const app = new cdk.App();
new Step03HelloAppsyncStack(app, 'Step03HelloAppsyncStack');
