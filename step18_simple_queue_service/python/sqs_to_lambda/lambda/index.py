from __future__ import print_function


def handler(event, context):
    for record in event['Records']:
        message = record['body']
        print(str(message))
        return message
