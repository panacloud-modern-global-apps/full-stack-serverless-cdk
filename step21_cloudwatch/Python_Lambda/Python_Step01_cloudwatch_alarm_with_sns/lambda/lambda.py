# pylint: disable=E1101

import boto3
from decimal import Decimal
from pprint import pprint
import os
from botocore.exceptions import ClientError


dynamodb = boto3.resource('dynamodb')
tableName = os.environ['HITS_TABLE_NAME']
table = dynamodb.Table(tableName)

print('start-4')


def handler(event, context):
    print('event', event)

    res = table.update_item(

        Key={'path':  event["rawPath"]}, 
        UpdateExpression="ADD hits :incr",
        ExpressionAttributeValues={
            ':incr': 1
        },
        ReturnValues="UPDATED_NEW"
    )
    return sendRes(200, 'You have connected with the Lambda!')


def sendRes(status, body):

    response = {
        'statusCode': status,
        'body': body,
    }

    return response
