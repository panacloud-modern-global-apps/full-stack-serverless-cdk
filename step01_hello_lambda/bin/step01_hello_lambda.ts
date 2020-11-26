#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { Step01HelloLambdaStack } from "../lib/step01_hello_lambda-stack";

const app = new cdk.App();
new Step01HelloLambdaStack(app, "Step01HelloLambdaStack");
