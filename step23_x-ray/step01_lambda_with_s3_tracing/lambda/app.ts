import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk-core";

import { APIGatewayEvent } from "aws-lambda";

exports.handler = (event: APIGatewayEvent) => {
  //variable that uses the sdk to record any s3 bucket activity in this application
  const s3 = AWSXRay.captureAWSClient(new AWS.S3());

  //this function lists all the s3 buckets
  s3.listBuckets((err, data) => {
    if (data) {
      console.log("Success", data.Buckets);
    } else {
      console.log("Error", err);
    }
  });
};
