
from __future__ import print_function
import os
import json
import boto3
import secrets

secretsManager = boto3.client('secretsmanager', region_name= os.environ['REGION'])
secretName = os.environ['SECRET_NAME']
keyInSecret = os.environ['KEY_IN_SECRET_NAME']


def handler(event, context):
    print(event)

    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name= os.environ['REGION'],
    )
    if event['Step'] == 'createSecret':
        client.put_secret_value(
                SecretId= secretName,
                SecretString= json.dumps({
                    keyInSecret : json.dumps(secrets.token_hex(64)) 
                }),
                VersionStages=['AWSCURRENT']
        )
