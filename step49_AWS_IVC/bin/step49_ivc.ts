#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step49IvcStack } from '../lib/step49_ivc-stack';

const app = new cdk.App();
new Step49IvcStack(app, 'Step49IvcStack');
