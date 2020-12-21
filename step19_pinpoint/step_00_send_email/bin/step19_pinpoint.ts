#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step19PinpointStack } from '../lib/step19_pinpoint-stack';

const env = {region : "us-west-2"}
const app = new cdk.App();
new Step19PinpointStack(app, 'Step19PinpointStack' , {env : env});
