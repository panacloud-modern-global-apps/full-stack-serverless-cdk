#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { FrontEnd, BackEnd } from '../lib/step18_multiple_stacks-stack';

const app = new cdk.App();
new FrontEnd(app, 'Step18MultipleStacksFrontEndStack');
new BackEnd(app, 'Step18MultipleStacksBackEndStack');
