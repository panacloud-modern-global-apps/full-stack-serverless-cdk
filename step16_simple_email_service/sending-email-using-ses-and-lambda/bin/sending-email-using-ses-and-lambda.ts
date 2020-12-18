#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SendingEmailUsingSesAndLambdaStack } from '../lib/sending-email-using-ses-and-lambda-stack';

const app = new cdk.App();
new SendingEmailUsingSesAndLambdaStack(app, 'SendingEmailUsingSesAndLambdaStack');
