#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { BackStacka } from '../lib/backStacka';

const app = new cdk.App();
new BackStacka(app, 'BackStack');
