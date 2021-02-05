#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { WafWithCustomRulesStack } from '../lib/waf-with-custom-rules-stack';

const app = new cdk.App();
new WafWithCustomRulesStack(app, 'WafWithCustomRulesStack');
