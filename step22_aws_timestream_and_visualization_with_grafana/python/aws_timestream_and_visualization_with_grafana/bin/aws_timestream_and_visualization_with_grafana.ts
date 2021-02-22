#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsTimestreamAndVisualizationWithGrafanaStack } from '../lib/aws_timestream_and_visualization_with_grafana-stack';

const app = new cdk.App();
new AwsTimestreamAndVisualizationWithGrafanaStack(app, 'AwsTimestreamAndVisualizationWithGrafanaStack');
