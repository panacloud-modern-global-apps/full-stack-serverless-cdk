

def handler(event, context):
    print("event", event)
    return {
        'statusCode': 200,
        'body': "Hello World"
    }