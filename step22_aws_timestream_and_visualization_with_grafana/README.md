# AWS Timestream And Visualization with Grafana

## Introduction to AWS Timestream

Amazon Timestream is a fast, scalable, and serverless time series database service for IoT and operational applications that makes it easy to store and analyze trillions of events per day up to 1,000 times faster and at as little as 1/10th the cost of relational databases. Amazon Timestream saves you time and cost in managing the lifecycle of time series data by keeping recent data in memory and moving historical data to a cost optimized storage tier based upon user defined policies. Amazon Timestream’s purpose-built query engine lets you access and analyze recent and historical data together, without needing to specify explicitly in the query whether the data resides in the in-memory or cost-optimized tier. Amazon Timestream has built-in time series analytics functions, helping you identify trends and patterns in your data in near real-time. Amazon Timestream is serverless and automatically scales up or down to adjust capacity and performance, so you don’t need to manage the underlying infrastructure, freeing you to focus on building your applications.

## Introduction to Grafana

Grafana which is a multi-platform open source analytics and interactive visualization web application. It provides charts, graphs, and alerts for the web when connected to supported data sources. We are going to be connecting it to Timestream here to visualize our activity data.

## Article

- Here's a article to understand more [Article](https://jason-wiker.medium.com/aws-timestream-introduction-with-apple-healthkit-grafana-and-aws-cdk-ccf7baeaaa98)

- AWS Timstream video link [getting started with AWS Timestream](https://www.youtube.com/watch?v=8RHFPNReylI&ab_channel=AmazonWebServices)

### For crud ops

[Github Repo](https://github.com/awslabs/amazon-timestream-tools/tree/master/sample_apps/js)

## Step 1

- Create a [new cdk project](https://github.com/panacloud-modern-global-apps/full-stack-serverless-cdk/tree/main/step00_hello_cdk)
- install the following dependencies of the same version:

```bash
    npm i @aws-cdk/aws-lambda @aws-cdk/aws-apigateway @aws-cdk/aws-timestream aws-sdk
```

## Step 2

- Create Timestream DB, TS Table, Lambda and API for Lambda integration, here's the code

```typescript
import * as timestream from '@aws-cdk/aws-timestream';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';

const TimeStreamDB = new timestream.CfnDatabase(this, 'TimeStreamDB', {
  databaseName: 'TimeStreamDB',
});

const DBTable = new timestream.CfnTable(this, 'TSTable', {
  tableName: 'TSTable',
  databaseName: TimeStreamDB.databaseName!,
});

const TSlambda = new lambda.Function(this, 'TSLambda', {
  runtime: lambda.Runtime.NODEJS_12_X,
  code: lambda.Code.fromAsset('lambda-fns'),
  handler: 'main.handler',
});

const postStepsIntegration = new apigateway.LambdaIntegration(TSlambda);

const api = new apigateway.RestApi(this, 'TSApi', {
  restApiName: 'TSApi',
  description: 'Testing TSDB',
});
```

## Step 4

Giving lambda acces to write records in TSTable, we need to make an iam policy to give lambda the access.

```typescript
const policy = new iam.PolicyStatement();
policy.addActions('timestream:DescribeEndpoints', 'timestream:WriteRecords');
policy.addResources('*');
```

Here I've made the policy and added actions of 'timestream:WriteRecords', 'timestream:WriteRecords'

- DescribeEndpoints returns a list of available endpoints to make Timestream API calls against. This API is available through both Write and Query.

- WriteRecords write your records to the TSTable.

You can also give,

```typescript
policy.addActions('timestream:*');
```

By 'timestream:\*' you add all actions on this resource.

Now,

```typescript
TSlambda.addToRolePolicy(policy);
```

add the poicy to the lambda to give the rights.

## Step 3

make a folder **lambda-fns** in it.

- Create a new file (main.ts) in **lambda-fns** folder

- Make simple Node.js Lambda function for putting constant data into Timestream Table Each time it is invoked

-Now whenever you invoke the Lambda by apigateway lambda integration, it'll add the constant data from lambda into the TS Table

### NOTE

creating SDK client

```typescript
const https = require('https');
const agent = new https.Agent({
  maxSockets: 5000,
});
writeClient = new AWS.TimestreamWrite({
  maxRetries: 10,
  httpOptions: {
    timeout: 20000,
    agent: agent,
  },
});
```

[link for SDK clinet](https://docs.aws.amazon.com/timestream/latest/developerguide/getting-started.node-js.code-sample.create-a-client-for-crud-operations-and-for-writing-data-into-timestream.html)

## Step 4 Installing Grafana

Link for installing Grafana [grafana](https://grafana.com/get)

```bash
sudo apt-get install -y adduser libfontconfig1
wget https://dl.grafana.com/oss/release/grafana_7.3.5_amd64.deb
sudo dpkg -i grafana_7.3.5_amd64.deb
```

for timestream plugin

```bash
grafana-cli plugins install grafana-timestream-datasource
```

## Step 5 Visualizing with Grafana

Now we can start to visualize the data we have created in Timestream

```bash
sudo service grafana-server start
```

go to localhost:3000 and login as username: admin , password: admin, and make the credentials as per your requirement

Select Add Data Source -> Timstream -> access & Secret key , add your credentials , select your DB and DBTable and start visualising with your grafana service.


[Step 22 Video in English on Facebook](https://www.facebook.com/zeeshanhanif/videos/10225763251372883)

[Step 22 Video in English on YouTube](https://www.youtube.com/watch?v=6kwKtE8d9dc)

[Step 22 Video in Urdu on Facebook](https://www.facebook.com/zeeshanhanif/videos/10225811165650710)

[Step 22 Video in Urdu on YouTube](https://www.youtube.com/watch?v=EgYiEO8P704)



# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
