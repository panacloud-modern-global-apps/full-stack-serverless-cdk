def handler(event, context):
    print(event)

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "text/plain"
        },
        "body": f"Hello, You've hit the path {event['path']}."
    }
