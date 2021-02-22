import boto3
import json
import os
from botocore.exceptions import ClientError



def handler(event):
    print('request: {}'.format(json.dumps(event)))
    try:
        topic_arn = os.environ['TOPIC_ARN']
        sns = boto3.client("sns")
        response = sns.publish(
            TopicArn=topic_arn,
            Message='This is Hello World Event Message',
        )
        print('request: {}'.format(json.dumps(response)))
    except ClientError as e:
        print(e.response['Error']['Message'])
