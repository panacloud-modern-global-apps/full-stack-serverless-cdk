#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { BackStack } from "../lib/back-stack";
import { env } from "process";

const app = new cdk.App();
new BackStack(app, "BackStack");
