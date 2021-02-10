#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CDKDesignPatternsAppStack } from '../lib/CDK-Design-Patterns-Stack';

const app = new cdk.App();
new CDKDesignPatternsAppStack(app, 'CDKDesignPatternsAppStack');
