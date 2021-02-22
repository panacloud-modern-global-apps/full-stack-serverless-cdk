#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Example01LambdaDestinationWithDifferentDestinationsStack } from '../lib/example01_lambda_destination_with_different_destinations-stack';

const app = new cdk.App();
new Example01LambdaDestinationWithDifferentDestinationsStack(app, 'Example01LambdaDestinationWithDifferentDestinationsStack');
