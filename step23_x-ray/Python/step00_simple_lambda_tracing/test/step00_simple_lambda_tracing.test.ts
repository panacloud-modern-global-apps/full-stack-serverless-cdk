import {
  expect as expectCDK,
  matchTemplate,
  MatchStyle,
} from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as Step00SimpleLambdaTracingStack from "../lib/step00_simple_lambda_tracing-stack";

test("Empty Stack", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Step00SimpleLambdaTracingStack.Step00SimpleLambdaTracingStack(
    app,
    "MyTestStack"
  );
  // THEN
  expectCDK(stack).to(
    matchTemplate(
      {
        Resources: {},
      },
      MatchStyle.EXACT
    )
  );
});
