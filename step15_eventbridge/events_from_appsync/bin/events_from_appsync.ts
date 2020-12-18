#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { EventsFromAppsyncStack } from '../lib/events_from_appsync-stack';

const app = new cdk.App();
new EventsFromAppsyncStack(app, 'EventsFromAppsyncStack');
