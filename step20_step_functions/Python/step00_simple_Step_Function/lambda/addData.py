from __future__ import print_function

import os
import boto3
import datetime


# Get the service resource.
dynamodb = boto3.resource('dynamodb')

# set environment variable
TABLE_NAME = os.environ['DynamoTable']


def handler(event, context):
    table = dynamodb.Table(TABLE_NAME)

    generateId = datetime.datetime.now()
    idString = generateId.strftime("%m/%d/%Y, %H:%M:%S")    
    # put item in table    
    try:
        table.put_item(
        Item={
            'id': idString,
            'entry': 'New Entry Added'
            }
        )
        print('event', event)    
        print("PutItem succeeded:")
        return {'operationSuccessful':True}
        #await return json.loads(json.dumps({'operationSuccessful':True}, default=str))
    except:
        #await return  json.loads(json.dumps({'operationSuccessful':False}, default=str))
        return {'operationSuccessful':False}
    
    
        
