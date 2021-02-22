#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PinPointStack } from '../lib/pin_point-stack';

const app = new cdk.App();
new PinPointStack(app, 'PinPointStack');
