#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step03ChoicePart2Stack } from '../lib/step03_choice_part2-stack';

const app = new cdk.App();
new Step03ChoicePart2Stack(app, 'Step03ChoicePart2Stack');
