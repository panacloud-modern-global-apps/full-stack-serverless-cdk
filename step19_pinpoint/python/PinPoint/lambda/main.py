import boto3
from botocore.exceptions import ClientError


AWS_REGION = 'us-west-2'

SENDER_ADDRESS = "utahir662@gmail.com"

APP_ID = "7a30dfc5b4cb4a3695975b9977bfeb49"

SUBJECT = "AMAZON PINPOINT IN PRATICE WITH PYTHON"

BODY_TEXT = "Amazon Pinpoint Test Email"

HTML_BODY = """<html>
<head></head>
<body>
<h1>Amazon Pinpoint Test</h1>
<p>This email was sent using Amazon Pinpoint</p>
</body>
"""

CHATSET = "UTF-8"

client = boto3.client('pinpoint', region_name=AWS_REGION)


def handler(event, context):
    TO_ADDRESS = event['arguments']['recipientEmail']

    try:
        response = client.send_messages(
            ApplicationId=APP_ID,
            MessageRequest={
                'Addresses': {
                    TO_ADDRESS: {
                        'ChannelType': 'EMAIL'
                    }
                },
                'MessageConfiguration': {
                    'EmailMessage': {
                        'FromAddress': SENDER_ADDRESS,
                        'SimpleEmail': {
                            'Subject': {
                                'Data': SUBJECT
                            },
                            'HtmlPart': {
                                'Data': HTML_BODY
                            },
                            'TextPart': {
                                'Data': BODY_TEXT
                            }
                        }
                    }
                }
            }
        )
        print('Message Sent! Message ID : ' + str(response))
    except ClientError as error:
        print(error.response['Error']['Message'])
