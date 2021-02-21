import json
import boto3


def handler(event, context):
    client = boto3.client('ses')
    field = event['body']
    #reading json from frontend
    data = json.loads(field)

    SUBJECT = data["subject"]
    BODY_TEXT = data["text"]
    TO = data["to"]
    FROM = data["from"]
    print(TO)
    message = {"Subject": {"Data": SUBJECT},
               "Body": {"Html": {"Data": BODY_TEXT}}}

    response = client.send_email(Source=FROM, Destination={
                                 "ToAddresses": [TO]}, Message=message)

    return {
        'statusCode': 200,
        'body': response
    }
