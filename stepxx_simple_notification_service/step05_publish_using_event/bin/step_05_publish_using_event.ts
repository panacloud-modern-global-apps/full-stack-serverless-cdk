#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Step05PublishUsingEventStack } from '../lib/step_05_publish_using_event-stack';

const app = new cdk.App();
new Step05PublishUsingEventStack(app, 'Step05PublishUsingEventStack');
