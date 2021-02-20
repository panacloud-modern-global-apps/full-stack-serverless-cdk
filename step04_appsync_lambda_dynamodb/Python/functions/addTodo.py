import boto3
import os
import logging
from botocore.exceptions import ClientError
import json

dynamodb = boto3.resource('dynamodb')
tableName = os.environ['TODOS_TABLE']
table = dynamodb.Table(tableName)
print(tableName)


def addTodoItem(todo):
    try:
        res =table.put_item(
            Item=todo
        )
    except ClientError as e:
        logging.error(e) 
    return json.dumps(res)
