import json
import os
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from datetime import datetime


def handler(event):
    session = boto3.Session()
    write_client = session.client('timestream-write', config=Config(
        read_timeout=20, max_pool_connections=5000, retries={'max-attempts': 10}))
    current_time = datetime.now()

    database = os.environ['TS_DATABASE_NAME']
    tablename = os.environ['TS_TABLE_NAME']

    dimensions = [
        {'Name': 'region', 'Value': 'us-west-2'},
        {'Name': 'az', 'Value': 'az1'},
        {'Name': 'hostname', 'Value': 'usama'}
    ]

    cpu_utilization = {
        'Dimensions': dimensions,
        'MeasureName': 'cpu_utilization',
        'MeasureValue': '13.5',
        'MeasureValueType': 'DOUBLE',
        'Time': current_time
    }

    memory_utilization = {
        'Dimensions': dimensions,
        'MeasureName': 'memory_utilization',
        'MeasureValue': '40',
        'MeasureValueType': 'DOUBLE',
        'Time': current_time
    }

    records = [cpu_utilization, memory_utilization]

    try:
        result = event.client.write_records(
            DatabaseName=database, TableName=tablename, Records=records, CommonAttributes={})
        print("WriteRecords Status: [%s]" %
              result['ResponseMetadata']['HTTPStatusCode'])
    except ClientError as err:
        print('Failed Writing Data')
        print("Error:", err)
