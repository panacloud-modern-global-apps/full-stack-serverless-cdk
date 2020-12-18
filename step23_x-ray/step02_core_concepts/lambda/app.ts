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
