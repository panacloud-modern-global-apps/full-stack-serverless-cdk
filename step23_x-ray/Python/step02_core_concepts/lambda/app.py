from __future__ import print_function
from aws_xray_sdk.core import xray_recorder
from aws_xray_sdk.core import patch_all
import boto3

patch_all()
s31 = boto3.client('s3')


  # //variable that uses the sdk to record any s3 bucket activity in this application
def handler(event, context):
    segment = xray_recorder.current_segment()
  # created new subSegment named GenerateId
    subSegment = xray_recorder.begin_subsegment("GenerateId")
    ide = "99"
    name = "Jhon"
    company = "panacloud"
# Adding Annotations to our subsegments
    subSegment.put_annotation("userId", ide)
    subSegment.put_annotation("userName", name)
    subSegment.put_annotation("userCompany", company)

    xray_recorder.end_subsegment()

    s3 = boto3.client('s3')
  
    p = s3.list_buckets()
    print(p)
  # //this function lists all the s3 buckets
    for buk in p['Buckets']:
        print(buk["Name"])
    return {
        'statusCode': 200,
        'body':  {
        "userId": ide,
        "userName": name,
        "userCompany": company,
    }
      }

