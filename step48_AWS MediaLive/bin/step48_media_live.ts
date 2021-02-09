#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MediaLiveStack } from '../lib/media_live-stack';

const app = new cdk.App();
new MediaLiveStack(app, 'MediaLiveStack');