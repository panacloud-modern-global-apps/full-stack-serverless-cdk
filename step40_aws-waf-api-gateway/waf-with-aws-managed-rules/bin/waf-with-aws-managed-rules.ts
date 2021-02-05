#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { WafWithAwsManagedRulesStack } from '../lib/waf-with-aws-managed-rules-stack';

const app = new cdk.App();
new WafWithAwsManagedRulesStack(app, 'WafWithAwsManagedRulesStack');
