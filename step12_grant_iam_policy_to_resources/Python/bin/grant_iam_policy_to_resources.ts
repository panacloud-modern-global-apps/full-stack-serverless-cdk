#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { GrantIamPolicyToResourcesStack } from '../lib/grant_iam_policy_to_resources-stack';

const app = new cdk.App();
new GrantIamPolicyToResourcesStack(app, 'GrantIamPolicyToResourcesStack');
