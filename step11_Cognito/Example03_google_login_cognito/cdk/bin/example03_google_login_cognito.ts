#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Example03GoogleLoginCognitoStack } from '../lib/example03_google_login_cognito-stack';

const app = new cdk.App();
new Example03GoogleLoginCognitoStack(app, 'Example03GoogleLoginCognitoStack');
