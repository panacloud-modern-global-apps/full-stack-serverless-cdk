#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { BasicRedshiftStack } from '../lib/basic_redshift-stack';

const app = new cdk.App();
new BasicRedshiftStack(app, 'BasicRedshiftStack');
