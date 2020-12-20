## AWS EFS With Lambda Function

### EFS (Elastic File System)

Amazon Elastic File System [Amazon EFS](https://aws.amazon.com/efs/) provides a simple, scalable, fully managed elastic NFS file system for use with AWS Cloud services and on-premises resources. It is built to scale on demand to petabytes without disrupting applications, growing and shrinking automatically as you add and remove files, eliminating the need to provision and manage capacity to accommodate growth.

Amazon EFS is designed to provide massively parallel shared access to thousands of Amazon EC2 instances, enabling your applications to achieve high levels of aggregate throughput and IOPS with consistent low latencies.

## Why We Use EFS With Lambda

Lambda function was limited to 512MB of /tmp directory storage.While this is sufficient for most use cases, it’s oftenprohibitive for use cases such as Machine Learning, asTensorflow models are often GBs in size and cannot fit into thelimited /tmp storage. Or maybe you’re processing large amounts(say, GBs) of data and need to store them in the /tmp directoryfor easier access

Amazon EFS is a fully managed, elastic, shared file system designed to be consumed by other AWS services, such as Lambda. With the release of Amazon EFS for Lambda, you can now easily share data across function invocations. You can also read large reference data files, and write function output to a persistent and shared store.

## How To Connect EFS With Lambda

#### Step 1 (Create An EFS File System)

- Create a cdk project using this command `npm i cdk init app --language=typescript`

- install following dependencies `npm i aws-cdk/aws-efs aws-cdk/aws-ec2 aws-cdk/aws-lambda aws-cdk aws-efs @aws-cdk/aws-apigatewayv2 @aws-cdk/aws-apigatewayv2-integrations`

```typescript
import * as efs from "@aws-cdk/aws-efs";
import * as ec2 from "@aws-cdk/aws-ec2";

const myVpc = new ec2.Vpc(this, "Vpc", {
  maxAzs: 2,
});
const fileSystem = new efs.FileSystem(this, "lambdaEfsFileSystem", {
  vpc: myVpc,
});
```

Amazon Virtual Private Cloud (Amazon VPC) is a service that lets you launch AWS resources in a logically isolated virtual network that you define. You have complete control over your virtual networking environment, including selection of your own IP address range, creation of subnets, and configuration of route tables and network gateways.

A Virtual Private Cloud (VPC) is required to create an Amazon EFS file system.

#### Step 2 (Creating An Access Ponit)

```typescript
const accessPoint = fileSystem.addAccessPoint("AccessPoint", {
  createAcl: {
    ownerGid: "1001",
    ownerUid: "1001",
    permissions: "750",
  },
  path: "/export/lambda",
  posixUser: {
    gid: "1001",
    uid: "1001",
  },
});
```

<!--
Amazon EFS access points are application-specific entry points into an EFS file system that make it easier to manage application access to shared datasets. Access points can enforce a user identity, including the user's POSIX groups, for all file system requests that are made through the access point.Access points can also enforce a different root directory for the file system so that clients can only access data in the specified directory or its subdirectories. -->

Amazon EFS access points are application-specific entry points into an EFS file system that make it easier to manage application access to shared datasets.

To give Lambda functions access to the file system, we need to create EFS access points. These are application-specific entry points to an EFS file system. In the this example, we created an access point that allows root access to the /export/lambda directory in the file system. We can use access points to control what directories on a shared file system a function can access.

#### Step 3 (Creating a Lambda Function)

```typescript
import * as lambda from "@aws-cdk/aws-lambda";

const efsLambda = new lambda.Function(this, "efsLambdaFunction", {
  runtime: lambda.Runtime.NODEJS_12_X,
  code: lambda.Code.fromAsset("lambda"),
  handler: "msg.handler",
  vpc: myVpc,
  filesystem: lambda.FileSystem.fromEfsAccessPoint(accessPoint, "/mnt/msg"),
});
```

This sample allows the lambda function to mount the Amazon EFS access point to /mnt/msg in the runtime environment and access the filesystem with the POSIX identity defined in posixUser.

#### Step 4 (lambda Function Code)

- Create a directory name lambda in root.

- In lambda directory create a file with a (msg.ts) name.

```typescript
const fs = require("fs").promises;
const MSG_FILE_PATH = "/mnt/msg/content";

exports.handler = async (event: any) => {
  console.log(event);
  const method = event.requestContext.http.method;
  if (method === "GET") {
    return sendRes(200, await getMessages());
  } else if (method === "POST") {
    await createMessage(event.body);
    return sendRes(200, await getMessages());
  } else if (method === "DELETE") {
    await deleteMessages();
    sendRes(200, "messages deleted");
    return sendRes(200, await getMessages());
  } else {
    return sendRes(200, "Method unsupported");
  }
};
```

In this lambda function, fs(file System) library from nodejs is used to interact with EFS . We didn't use any AWS-SDKs to interact with EFS because in Step 3 we mount the function local Storage with EFS.

In the handler, we don't have a route for every method so, we just destructure the (HTTP) request method from the event and doing some cases depending on the method. When (GET) request is made from an API gateway we call (getMessage) function whose responsibility is to get all the messages from file . If we have a (POST) request we add a new message in a file that is coming in the event body then display all the messages and if we get (DELETE) request we delete all the messages.

```typescript
const createMessage = async (message: string) => {
  try {
    await fs.appendFile(MSG_FILE_PATH, message + "\n");
  } catch (error) {
    console.log("error in creating msg", error);
  }
};
```

This function is Asynchronously append data to a file, creating the file if it does not yet exist.

```typescript
const getMessages = async () => {
  try {
    return await fs.readFile(MSG_FILE_PATH, "utf8");
  } catch (error) {
    console.log("error in getting messages", error);
  }
};
```

This function Asynchronously reads the entire contents of a file.

```typescript
const deleteMessages = async () => {
  console.log("delete all messages");
  try {
    await fs.unlink(MSG_FILE_PATH);
  } catch (error) {
    console.log("error in deleting", error);
  }
};
```

This function Asynchronously removes a file

#### Step 5 (Creating an API)

```typescript
const api = new apigw.HttpApi(this, "Endpoint", {
  defaultIntegration: new integrations.LambdaProxyIntegration({
    handler: efsLambda,
  }),
});
```

Lambda integrations enable integrating an HTTP API route with a Lambda function. When a client invokes the route, the API Gateway service forwards the request to the Lambda function and returns the function's response to the client.
