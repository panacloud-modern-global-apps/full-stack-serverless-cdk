import {
  expect as expectCDK,
  matchTemplate,
  MatchStyle,
} from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as Step01LambdaWithS3TracingStack from "../lib/step01_lambda_with_s3_tracing-stack";

test("Empty Stack", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Step01LambdaWithS3TracingStack.Step01LambdaWithS3TracingStack(
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
