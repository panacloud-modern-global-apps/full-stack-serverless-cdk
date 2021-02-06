#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Greengrassv2Stack } from '../lib/greengrassv2-stack';

const app = new cdk.App();
new Greengrassv2Stack(app, 'Greengrassv2Stack');
