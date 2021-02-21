import boto3
import os
import logging
from botocore.exceptions import ClientError
dynamodb = boto3.resource('dynamodb')
tableName = os.environ['TODOS_TABLE']
table = dynamodb.Table(tableName)


def deleteItem(todoId):
    try:
        res = table.delete_item(
            Key={
                'id': todoId
            }
        )

        return todoId
    except ClientError as e:
        logging.error(e)
