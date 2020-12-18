#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Example00LambdaDestinationEventBridgeStack } from '../lib/example00_lambda_destination_event_bridge-stack';

const app = new cdk.App();
new Example00LambdaDestinationEventBridgeStack(app, 'Example00LambdaDestinationEventBridgeStack');
