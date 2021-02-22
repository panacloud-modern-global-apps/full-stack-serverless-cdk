# Multiple stacks App With CDK
Most of the other code examples in the [full-stack-serverless-cdk](https://github.com/panacloud-modern-global-apps/full-stack-serverless-cdk "full-stack-serverless-cdk") Guide involve only a single stack. However, you can create apps containing any number of stacks. Each stack results in its own AWS CloudFormation template. Stacks are the unit of deployment, each stack in an app can be synthesized and deployed individually using the cdk deploy command. [Create an app with multiple stacks](https://docs.aws.amazon.com/cdk/latest/guide/stack_how_to_create_multiple_stacks.html "Create an app with multiple stacks")

Lets start building our first multi-stack app in the following code example. In this example we are going to create two stacks, one for front-end and one for back-end.

### Step 1: Setup a CDK directory
`cdk init app --language typescript`

### Step2: Install following dependency
- `npm install @aws-cdk/aws-apigateway @aws-cdk/aws-cloudfront @aws-cdk/aws-cloudfront-origins @aws-cdk/aws-lambda @aws-cdk/aws-s3 @aws-cdk/aws-s3-deployment  @aws-cdk/core aws-lambda`

- `npm install @types/aws-lambda --save-dev`

### Step 3: Setup the back-end utilities
In our back-end stack we will use a simple lambda fuction with apigatway, first make a folder of **backend** in your CDK root directory and inside it run the command `npm init -y && npm install node-random-name`. After that create a lambda.ts file inside it and then paste the following code.
```javascript
//backend/lambda.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
const randomName = require('node-random-name');

exports.handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {

    const name = randomName();

    console.log("Random Name ==>", name);

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
            randomName: name,
        }),
    }
}
```

### Step 4: Setup the front-end utilities
In our front-end stack we will use a simple index.html file to deploy on cloudfront. First make a folder of **frontend** in your CDK root directory and inside it create index.html file and paste the following code.
```html
<!-- frontend/index.html -->
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>S3 Front End</title>
    <style>
        .container {
            height: 100vh;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: larger;
        }

        .container>button {
            font-size: inherit;
            padding: 10px;
            border-radius: 10px;
        }

        .name {
            margin-left: 10px;
        }
    </style>
</head>

<body>
    <div class="container">
        <button onclick="generateName()">Generate Name</button>
        <span class="name"></span>
    </div>

    <script>
        const generateName = async () => {
            const nameSpan = document.querySelector('.name');
            nameSpan.innerHTML = 'Loading....'
            const result = await fetch("< your lambda API >")
            const data = await result.json();
            console.log(data);
            nameSpan.innerHTML = data.randomName;
        }
    </script>

</body>

</html>
```
> ####  **NOTE**
   In the above HTML code at line # 41 there is a string inside fetch `"< your lambda API >"` you have to replace it with your backend rest API which you will get in the coming step.

### Step 5: Setup the frontend and backend stack
Write this code inside your **lib/stact.ts**
```javascript
//lib/stact.ts
import * as cdk from '@aws-cdk/core';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigw from "@aws-cdk/aws-apigateway";

////////////////////////////////////// First Stack - Front-end ////////////////////////////////////////

export class FrontEnd extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket',
      {
        websiteIndexDocument: 'index.html',
        publicReadAccess: true,
        versioned: true     ///bucket versioning
      }
    );

    const distribution = new cloudfront.Distribution(this, 'myDist', {
      defaultBehavior: { origin: new origins.S3Origin(websiteBucket) },
    });

    // Prints out the web endpoint to the terminal
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: `https://${distribution.domainName}`
    })

    const websiteDeployment = new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('./frontend')],
      destinationBucket: websiteBucket,
      distribution: distribution
    });
  }
}

////////////////////////////////////// Second Stack - Back-end ////////////////////////////////////////

export class BackEnd extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const backendLambda = new lambda.Function(this, "SimpleLambda", {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.fromAsset("backend"),
      handler: "lambda.handler",
    });

    new apigw.LambdaRestApi(this, "Endpoint", {
      handler: backendLambda,
    });
  }
}
```
Write this code inside **bin/stack.ts**
```javascript
//bin/stack.ts
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { FrontEnd, BackEnd } from '../lib/stack';

const app = new cdk.App();
new FrontEnd(app, 'FrontEndStack');
new BackEnd(app, 'BackEndStack');
```

### Step 6: Lets deploy
- Before deployment run  `npm run build` in your cdk root directory.

- After completing the above steps, now first you have to deploy your backend stack. To deploy the backend stack run `cdk deploy BackEndStack`. After deployment you will get a restapi endpoint in your console to access your lambda, which looks something like this `Outputs:
BackEndStack.DistributionDomainName = https://dpiuy6ggai1qv.cloudfront.net`. Copy this API, go to  **frontend/index.html** and replace this `"< your lambda API >"` with the backend API.

- Now you can deploy both the stacks by running this command `cdk deploy --all` or you can simply deploy your frontend by running this command `cdk deploy FrontEndStack`. Once your frontend stack deployed, you will get output like this `Outputs:
FrontEndStack.DistributionDomainName = https://d1n3jxrnp6pe1v.cloudfront.net`. You can access your frontend by this url.
