#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { RedshiftS3Stack } from '../lib/redshift_s3-stack';

const app = new cdk.App();
new RedshiftS3Stack(app, 'RedshiftS3Stack');
