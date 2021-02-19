#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { FargateAlbPathBasedRoutingStack } from '../lib/fargate_alb_path_based_routing-stack';

const app = new cdk.App();
new FargateAlbPathBasedRoutingStack(app, 'FargateAlbPathBasedRoutingStack');
