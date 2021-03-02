#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step44VpcStack } from '../lib/step44_vpc-stack';

const app = new cdk.App();
new Step44VpcStack(app, 'Step44VpcStack');
