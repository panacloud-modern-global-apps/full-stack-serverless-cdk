#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step02MultiStackTestingStack } from '../lib/step02_multi_stack_testing-stack';

const app = new cdk.App();
new Step02MultiStackTestingStack(app, 'Step02MultiStackTestingStack');
