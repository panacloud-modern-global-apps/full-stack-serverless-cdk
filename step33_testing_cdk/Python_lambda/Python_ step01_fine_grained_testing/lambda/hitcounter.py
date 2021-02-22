# pylint: disable=E1101

import boto3
from decimal import Decimal
from pprint import pprint
import os
from botocore.exceptions import ClientError

import json


#     create AWS SDK clients
dynamodb = boto3.resource('dynamodb')
lambdaClient = boto3.client('lambda')
tableName = os.environ['HITS_TABLE_NAME']
table = dynamodb.Table(tableName)
functionName = os.environ['DOWNSTREAM_FUNCTION_NAME']


# update dynamo entry for "path" with hits++


def handler(event, context):
    print('event', event)

    res = table.update_item(

        Key={'path':  event["path"]},
        UpdateExpression="ADD hits :incr",
        ExpressionAttributeValues={
            ':incr': 1
        },
        ReturnValues="UPDATED_NEW"
    )

#     // call downstream function and capture response

    response = lambdaClient.invoke(
        FunctionName=functionName,
        Payload=json.dumps(event)
    )

    return json.loads(response['Payload'])
