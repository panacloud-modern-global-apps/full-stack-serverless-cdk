#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Example06GoogleLoginCognitoStack } from '../lib/example06_google_login_cognito-stack';

const app = new cdk.App();
new Example06GoogleLoginCognitoStack(app, 'Example06GoogleLoginCognitoStack');
