#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Example01RotateSecretWithLambdaStack } from '../lib/example01_rotate_secret_with_lambda-stack';

const app = new cdk.App();
new Example01RotateSecretWithLambdaStack(app, 'Example01RotateSecretWithLambdaStack');
