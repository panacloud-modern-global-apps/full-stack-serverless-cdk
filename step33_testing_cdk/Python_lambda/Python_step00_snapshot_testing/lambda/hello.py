import json

def handler(event, context):
    print("event", json.dumps(event))
    return {
        'statusCode': 200,
        'body': "Hello, CDK!"
    }
