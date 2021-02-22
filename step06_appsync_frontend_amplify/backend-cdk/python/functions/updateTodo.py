import boto3
import os
import logging
from botocore.exceptions import ClientError
import re

dynamodb = boto3.resource('dynamodb')
tableName = os.environ['TODOS_TABLE']
table = dynamodb.Table(tableName)
# print(tableName)


def updateItem(todo):

    try:
        res = table.update_item(
            Key={
                'id': todo['id'],

            },
            UpdateExpression="set title = :d",
            ExpressionAttributeValues={
                ":d": todo['title']
            },

            ReturnValues="UPDATED_NEW",
        )
        return res
    except ClientError as e:
        logging.error(e)