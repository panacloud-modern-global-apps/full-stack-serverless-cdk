#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step52DocDbStack } from '../lib/step52_doc_db-stack';

const app = new cdk.App();
new Step52DocDbStack(app, 'Step52DocDbStack');
