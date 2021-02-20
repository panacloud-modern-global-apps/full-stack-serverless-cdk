## Introduction

So far we have learned about how to enable X-Ray Tracing in lambda, How to view traces data of different Segments using X-Ray. In this step we are going to learn about more features of X-Ray i.e

- Subsegments
- Annotations
- Metadata
- Groups

#### We are going to continue with [previous step](https://github.com/panacloud-modern-global-apps/full-stack-serverless-cdk/tree/main/stepxx_x-ray/step01_lambda_with_s3_tracing) example and add more features of X-Ray in it.

### Subsegments:

A segment can break down the data about the work done into subsegments. Subsegments provide more granular timing information and details about downstream calls that your application made to fulfill the original request. A subsegment can contain additional details about a call to an AWS service, an external HTTP API, or an SQL database. You can even define arbitrary subsegments to instrument specific functions or lines of code in your application.

### Annotations and metadata:

When you instrument your application, the X-Ray SDK records information about incoming and outgoing requests, the AWS resources used, and the application itself. You can add other information to the segment document as annotations and metadata. Annotations and metadata are aggregated at the trace level, and can be added to any segment or subsegment.

**Annotations** are simple key-value pairs that are indexed for use with filter expressions. Use annotations to record data that you want to use to group traces in the console, or when calling the GetTraceSummaries API.

**Metadata** are key-value pairs with values of any type, including objects and lists, but that are not indexed. Use metadata to record data you want to store in the trace but don't need to use for searching traces.

### Groups:

Extending filter expressions, X-Ray also supports the group feature. Using a filter expression, you can define criteria by which to accept traces into the group.

### Resources

- [Subsegments](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-subsegments)
- [Annotations and metadata](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-annotations)
- [Groups](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-groups)

## Step 1

Update the lambda function code with the following

```typescript
import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk-core";
import { APIGatewayEvent } from "aws-lambda";

//This Function is genrating random id
const uuidv4 = () => {
  return "xxxx-4xxx-yxxx-".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

exports.handler = async (event: APIGatewayEvent) => {
  const segment = AWSXRay.getSegment();

  // created new subSegment named GenerateId
  const subSegment = segment?.addNewSubsegment("GenerateId");
  uuidv4();
  subSegment?.close();

  //variable that uses the sdk to record any s3 bucket activity in this application
  const s3 = AWSXRay.captureAWSClient(new AWS.S3());

  //this function lists all the s3 buckets
  await s3
    .listBuckets((err, data) => {
      if (data) {
        console.log("Success", data.Buckets);
      } else {
        console.log("Error", err);
      }
    })
    .promise();
};
```

- In the above code first, we created the function which is generating a random id we made this function just to see how that block of code performing.
- Next, we created a new subsegment named `GenerateId` and before closing it, we call the function `uuidv4()` inside of it, so it will create a subsegment of that function.
- Now we are ready to deploy the function and test new data.

## Step 2

After testing the function notice that the average execution time increased in the service map. then move to the individual trace.
![subsegment](imgs/subsegment.png)
Here you can see that the subsegment which was added is being shown on the timeline, allowing you to visualize how that block of code performing compared to the rest of the application.

## Step 3

We can also configure our applications to report annotations and metadata to the X-Ray service let's add a couple of annotations as an example in our lambda handler code.

```typescript
import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk-core";
import { APIGatewayEvent } from "aws-lambda";

//This Function is genrating random id
const uuidv4 = () => {
  return "xxxx-4xxx-yxxx-".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

exports.handler = async (event: APIGatewayEvent) => {
  const segment = AWSXRay.getSegment();
  // created new subSegment named GenerateId
  const subSegment = segment?.addNewSubsegment("GenerateId");

  const id = uuidv4();
  const name = "Jhon";
  const company = "panacloud";

  // Adding Annotations to our subsegments
  subSegment?.addAnnotation("userId", id);
  subSegment?.addAnnotation("userName", name);
  subSegment?.addAnnotation("userCompany", company);

  subSegment?.close();

  //variable that uses the sdk to record any s3 bucket activity in this application
  const s3 = AWSXRay.captureAWSClient(new AWS.S3());

  //this function lists all the s3 buckets
  await s3
    .listBuckets((err, data) => {
      if (data) {
        console.log("Success", data.Buckets);
      } else {
        console.log("Error", err);
      }
    })
    .promise();

  return {
    statusCode: 200,
    body: {
      userId: id,
      userName: name,
      userCompany: company,
    },
  };
};
```

We have added three annotations above `userId`, `userName`, and `userCompany` note that we have added userCompany as a `panacloud` later we will make a group of it to filter traces. now let's deploy the function and test it.

## Step 4

You can see more details about each segment or subsegment by clicking on it. in our case, we can see annotations data by clicking on our subsegment i.e `GenerateId`.

![subsegment](imgs/annotations.png)

We can use these annotations to filter trace data, for example, let's filter to see all traces for a specific userCompany value. to do that, AWS X-Ray service provided us a search bar. In my case I need only those traces whose userCompany value is "panacloud" so I have to write filter expression i.e `annotation.userCompany="panacloud"` on a search bar and hit enter now it will show me only those traces whose userCompany value is "panacloud"

#### Notice that we have a button on the left of the search bar which is on `Default` we can create Groups and change Groups from there to see filtered data.

## Step 5

Let's create a group and see how it works.

- Navigate to the `Groups` from the sidebar to create a new group.
- Name the Group, and add a filter expression which in my case is `annotation.userCompany = "panacloud"`.
- Now simply click on the create group button.
- Our group is created successfully and now we can use is to filter traces.

## Cleanup

```bash
cdk destroy
```
