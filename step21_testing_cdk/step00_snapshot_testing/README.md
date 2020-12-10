# Snapshot Testing CDK

In this step we will write snapshot tests for constructs.Snapshot tests test the synthesized AWS CloudFormation template against a previously-stored baseline template. This way, when you're refactoring your app, you can be sure that the refactored code works exactly the same way as the original. If the changes were intentional, you can accept a new baseline for future tests.

# Code Explanation

### Step1: Setup a CDK directory

`cdk init app --language typescript`

### Step2: Install following dependencies

`npm i @aws-cdk/aws-apigateway`

`npm i @aws-cdk/aws-dynamodb`

`npm i @aws-cdk/aws-lambda`

### Step3: Setup hello lambda function

Make a folder named lambda in the root of your project and add a hello.ts folder.Add the following snippet of code in hello.ts.This lambda function will send a string as a response.

```javascript
exports.handler = async function (event) {
  console.log("request:", JSON.stringify(event, undefined, 2));
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello, CDK!}\n`,
  };
};
```

### Step4: Setup hitcounter lambda function

Add hitcounter.ts file in lambda folder.Add the following snippet of code in hitcounter.ts.This lambda function will increment the value of hits in dynamo db for path and invoke hello lambda function.

```javascript
const { DynamoDB, Lambda } = require("aws-sdk");

exports.handler = async function (event: { path: any }) {
  console.log("request:", JSON.stringify(event, undefined, 2));

  // create AWS SDK clients
  const dynamo = new DynamoDB();
  const lambda = new Lambda();

  // update dynamo entry for "path" with hits++
  await dynamo
    .updateItem({
      TableName: process.env.HITS_TABLE_NAME,
      Key: { path: { S: event.path } },
      UpdateExpression: "ADD hits :incr",
      ExpressionAttributeValues: { ":incr": { N: "1" } },
    })
    .promise();

  // call downstream function and capture response
  const resp = await lambda
    .invoke({
      FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
      Payload: JSON.stringify(event),
    })
    .promise();

  console.log("downstream response:", JSON.stringify(resp, undefined, 2));

  // return response back to upstream caller
  return JSON.parse(resp.Payload);
};
```

### Step5: Setup hitcounter construct

Create hicounter.ts file in lib folder.Add the following snippet of code.This construct will use hitcounter lambda function and creates a dynamodb table.This file is very important.We will test this construct.

```javascript
import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';

export interface HitCounterProps {
    /** the function for which we want to count url hits **/
    downstream: lambda.IFunction;
}

export class HitCounter extends cdk.Construct {
    public readonly handler: lambda.Function;

    constructor(scope: cdk.Construct, id: string, props: HitCounterProps) {
        super(scope, id);
        const table = new dynamodb.Table(this, 'Hits', {
            partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING }
        });

        this.handler = new lambda.Function(this, 'HitCounterHandler', {
            runtime: lambda.Runtime.NODEJS_10_X,
            handler: 'hitcounter.handler',
            code: lambda.Code.fromAsset('lambda'),
            environment: {
                DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
                HITS_TABLE_NAME: table.tableName
            }
        });
        table.grantReadWriteData(this.handler);
        props.downstream.grantInvoke(this.handler);

    }
}
```

### Step6:Setup Your Api Gateway and Lambda

Add the following snippet of code in your main stack.

```javascript
import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigw from "@aws-cdk/aws-apigateway";
import { HitCounter } from "./hitcounter";

export class Step00SnapshotTestingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // defines an AWS Lambda resource
    const hello = new lambda.Function(this, "HelloHandler", {
      runtime: lambda.Runtime.NODEJS_10_X, // execution environment
      code: lambda.Code.fromAsset("lambda"), // code loaded from "lambda" directory
      handler: "hello.handler", // file is "hello", function is "handler"
    });

    const helloWithCounter = new HitCounter(this, "HelloHitCounter", {
      downstream: hello,
    });
    // defines an API Gateway REST API resource backed by our "hello" function.
    new apigw.LambdaRestApi(this, "Endpoint", {
      handler: helloWithCounter.handler,
    });
  }
}
```

### Step7:Installing the testing framework

Since we're using the Jest framework, our next setup step is to install Jest. We'll also need the AWS CDK assert module, which includes helpers for writing tests for CDK libraries, including assert and expect.

`npm install --save-dev jest @types/jest @aws-cdk/assert`

### Step8:Updating package.json

Finally, edit the project's package.json to tell NPM how to run Jest, and to tell Jest what kinds of files to collect. The necessary changes are as follows.

- Add a new test key to the scripts section

- Add Jest and its types to the devDependencies section

- Add a new jest top-level key with a moduleFileExtensions declaration

These changes are shown in outline below. Place the new text where indicated in package.json. The "..." placeholders indicate existing parts of the file that should not be changed.

```javascript

{
  ...
 "scripts": {
    ...
    "test": "jest"
  },
  "devDependencies": {
    ...
    "@types/jest": "^24.0.18",
    "jest": "^24.9.0",
  },
  "jest": {
    "moduleFileExtensions": ["js"]
  }
}

```

### Step9: Add Snapshot tests

Add a snapshot test by placing the following code in test/hitcounter.test.ts.

```javascript

import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import * as lambda from '@aws-cdk/aws-lambda';
import { SynthUtils } from '@aws-cdk/assert';
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
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();

});

```

### Step10: Build project and run tests

To build the project and run the test, issue these commands.

`npm run build && npm test`

The output from Jest indicates that it has run the test and recorded a snapshot.

```
 PASS  test/hitcounter.test.ts
  ✓ DynamoDB Table Created (119 ms)

 › 1 snapshot written.
Snapshot Summary
 › 1 snapshot written from 1 test suite.

```

Jest stores the snapshots in a directory named **snapshots** inside the project. In this directory is a copy of the AWS CloudFormation template generated by the hitcounter construct. The beginning looks something like this.

```

exports[`DynamoDB Table Created 1`] = `
Object {
  "Parameters": Object {
    "AssetParametersd1b56bc1b22a97bff727ced44bd5f423908a61887637ffb86163d515be523b43ArtifactHash2FC30EF8": Object {
      "Description": "Artifact hash for asset \\"d1b56bc1b22a97bff727ced44bd5f423908a61887637ffb86163d515be523b43\\"",
      "Type": "String",
    },
    "AssetParametersd1b56bc1b22a97bff727ced44bd5f423908a61887637ffb86163d515be523b43S3Bucket7777265F": Object {
      "Description": "S3 bucket for asset \\"d1b56bc1b22a97bff727ced44bd5f423908a61887637ffb86163d515be523b43\\"",
      "Type": "String",
    },

```

To make sure the test works, change the construct so that it generates different AWS CloudFormation output, then build and test again. For example, add a memory size property of 1024 in lambda function of hit counter. The boldface line below shows the code that needs to be added to lib/hitcounter.ts.

```javascript
this.handler = new lambda.Function(this, "HitCounterHandler", {
  runtime: lambda.Runtime.NODEJS_10_X,
  handler: "hitcounter.handler",
  code: lambda.Code.fromAsset("lambda"),
  environment: {
    DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
    HITS_TABLE_NAME: table.tableName,
  },
  memorySize: 1024,
});
```

Build the project and run the tests again.

`npm run build && npm test`

```

 FAIL  test/hitcounter.test.ts
  ✕ DynamoDB Table Created (124 ms)

  ● DynamoDB Table Created

    expect(received).toMatchSnapshot()

    Snapshot name: `DynamoDB Table Created 1`

    - Snapshot  - 0
    + Received  + 1

    @@ -67,10 +67,11 @@
                    "Ref": "MyTestConstructHits24A357F0",
                  },
                },
              },
              "Handler": "hitcounter.handler",
    +         "MemorySize": 1024,
              "Role": Object {
                "Fn::GetAtt": Array [
                  "MyTestConstructHitCounterHandlerServiceRoleD0F1215D",
                  "Arn",
                ],

      16 |     });
      17 |     // THEN
    > 18 |     expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
         |                                                ^
      19 |
      20 | });
      21 |

      at Object.<anonymous> (test/hitcounter.test.ts:18:48)

 › 1 snapshot failed.
Snapshot Summary
 › 1 snapshot failed from 1 test suite. Inspect your code changes or run `npm test -- -u` to update them.

```

Jest has told us that the memory size attribute is added. To accept the new snapshot, issue:

`npm test -- -u`

Now we can run the test again and see that it passes.
