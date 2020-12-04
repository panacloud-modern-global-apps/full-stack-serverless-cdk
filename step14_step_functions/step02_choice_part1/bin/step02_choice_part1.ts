#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step02ChoicePart1Stack } from '../lib/step02_choice_part1-stack';

const app = new cdk.App();
new Step02ChoicePart1Stack(app, 'Step02ChoicePart1Stack');
