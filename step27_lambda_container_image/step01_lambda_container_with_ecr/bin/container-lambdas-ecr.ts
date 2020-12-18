#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ContainerLambdasEcrStack } from '../lib/container-lambdas-ecr-stack';

const app = new cdk.App();
new ContainerLambdasEcrStack(app, 'ContainerLambdasEcrStack');
