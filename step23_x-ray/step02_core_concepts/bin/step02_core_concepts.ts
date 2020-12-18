#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step02CoreConceptsStack } from '../lib/step02_core_concepts-stack';

const app = new cdk.App();
new Step02CoreConceptsStack(app, 'Step02CoreConceptsStack');
