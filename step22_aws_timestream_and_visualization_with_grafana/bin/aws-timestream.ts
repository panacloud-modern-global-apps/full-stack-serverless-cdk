#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsTimestreamStack } from '../lib/aws-timestream-stack';

const app = new cdk.App();
new AwsTimestreamStack(app, 'AwsTimestreamStack');
