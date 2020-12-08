# Fine-Grained Assertion Tests

In this step we will write fine grained assertion tests for constructs.Fine-grained assertions test specific aspects of the generated AWS CloudFormation template, such as "this resource has this property with this value." These tests help when you're developing new features, since any code you add will cause your snapshot test to fail even if existing features still work. When this happens, your fine-grained tests will reassure you that the existing functionality is unaffected.

This step will be same as last step.We will just add finegrained assertions instead of snapshot testing.We will just edit the hitcounter.test.ts in test folder.

## Create test for the DynamoDB table

Our hitcounter construct creates a simple dynamoDB table.Lets create a test that validates the table is getting created.

Add the following code in test/hitcounter.test.ts:

```javascript

import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import * as lambda from '@aws-cdk/aws-lambda';

import { HitCounter } from '../lib/hitcounter';

test('DynamoDB Table Created', () => {
    const stack = new cdk.Stack();
    // WHEN
    new HitCounter(stack, 'MyTestConstruct', {
        downstream: new lambda.Function(stack, 'TestFunction', {
            runtime: lambda.Runtime.NODEJS_10_X,
            handler: 'lambda.handler',
            code: lambda.Code.fromInline('test')
        })
    });
    // THEN
    expectCDK(stack).to(haveResource("AWS::DynamoDB::Table"));
});

```

This test is simply testing to ensure that the synthesized stack includes a DynamoDB table.

Run the test.

`npm run build && npm test`

You should se the output like this:

```
 PASS  test/hitcounter.test.ts (8.736 s)
  ✓ DynamoDB Table Created (117 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        9.397 s

```
