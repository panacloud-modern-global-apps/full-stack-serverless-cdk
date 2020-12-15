#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Example02ThirdPartyLoginStack } from '../lib/example02_third_party_login-stack';

const app = new cdk.App();
new Example02ThirdPartyLoginStack(app, 'Example02ThirdPartyLoginStack');
