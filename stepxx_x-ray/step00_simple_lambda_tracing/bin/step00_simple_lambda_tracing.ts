#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { Step00SimpleLambdaTracingStack } from "../lib/step00_simple_lambda_tracing-stack";

const app = new cdk.App();
new Step00SimpleLambdaTracingStack(app, "Step00SimpleLambdaTracingStack");
