from __future__ import print_function


def handler(event, context):
    message = event['Records'][0]['Sns']['Message']
    print("From SNS: " + message)
    return message
