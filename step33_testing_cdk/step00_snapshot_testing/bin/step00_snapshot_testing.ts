#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step00SnapshotTestingStack } from '../lib/step00_snapshot_testing-stack';

const app = new cdk.App();
new Step00SnapshotTestingStack(app, 'Step00SnapshotTestingStack');
