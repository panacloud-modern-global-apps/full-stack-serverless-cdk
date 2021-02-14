#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step47Ec2Stack } from '../lib/step47_ec2-stack';

const app = new cdk.App();
new Step47Ec2Stack(app, 'Step47Ec2Stack');
