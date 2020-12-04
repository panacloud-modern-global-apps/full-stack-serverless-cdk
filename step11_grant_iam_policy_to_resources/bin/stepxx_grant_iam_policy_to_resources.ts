#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { StepxxGrantIamPolicyToResourcesStack } from '../lib/stepxx_grant_iam_policy_to_resources-stack';

const app = new cdk.App();
new StepxxGrantIamPolicyToResourcesStack(app, 'StepxxGrantIamPolicyToResourcesStack');
