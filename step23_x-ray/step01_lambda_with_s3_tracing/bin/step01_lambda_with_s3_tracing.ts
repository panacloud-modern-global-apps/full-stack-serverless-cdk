#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { Step01LambdaWithS3TracingStack } from "../lib/step01_lambda_with_s3_tracing-stack";

const app = new cdk.App();
new Step01LambdaWithS3TracingStack(app, "Step01LambdaWithS3TracingStack");
