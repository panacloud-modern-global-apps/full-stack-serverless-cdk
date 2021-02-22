import boto3
import os
from botocore.exceptions import ClientError

sns = boto3.client("sns")
params = {}
topic_arn = os.environ['TOPIC_ARN']


def handler(event):
    Success = event['Records'][0]['body']

    if Success:
        print('Success')
        params = {
            'Messaage': {Success: True},
            'TopicArn': topic_arn
        }
    else:
        print('Fail')
        params = {
            'Messaage': {Success: False},
            'TopicArn': topic_arn
        }
    try:
        res = sns.publish(params)
        return {
            'statusCode': 200,
            'headers': {"Content-Type": "text/plain"},
            'body': res
        }
    except ClientError as e:
        print('Error', e)
