from __future__ import print_function
from aws_xray_sdk.core import xray_recorder
from aws_xray_sdk.core import patch_all

import boto3

patch_all()

s31 = boto3.client('s3')


  # //variable that uses the sdk to record any s3 bucket activity in this application
def handler(event, context):
   
    s31 = boto3.client('s3')
    print(event)
    p = s31.list_buckets()
    print(p)
  # //this function lists all the s3 buckets
    for buk in p['Buckets']:
        print(buk["Name"])
    return {
        'statusCode': 200,
        'body': "Hello World"
      }


