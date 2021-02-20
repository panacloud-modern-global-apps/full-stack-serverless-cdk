import boto3
import os
import logging
from botocore.exceptions import ClientError
import json
import re

dynamodb = boto3.resource('dynamodb')
tableName = os.environ['TODOS_TABLE']
table = dynamodb.Table(tableName)


def getItem():
    try:
        res = table.scan()
        data = res['Items']
        print(json.dumps(res))
        print(json.dumps(data))

    except ClientError as e:
        logging.error(e) 
    return json.dumps(data)