from __future__ import print_function

import os
import boto3


# Get the service resource.
dynamodb = boto3.resource('dynamodb')

# set environment variable
TABLE_NAME = os.environ['TABLE']


def handler(event, context):
    table = dynamodb.Table(TABLE_NAME)
    # put item in table
    id = event['arguments']['id']
    etext = event['arguments']['entry']
    response = table.put_item(
        Item={
            'id': id,
            'entry': etext
        }
    )
    print('event', event)    
    print("PutItem succeeded:")
    print(response)    

    return {'id':id, 'entry':etext}
