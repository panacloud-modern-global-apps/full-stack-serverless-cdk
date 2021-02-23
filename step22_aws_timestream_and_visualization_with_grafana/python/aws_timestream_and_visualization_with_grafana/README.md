
# Steps to compile the code

## Step 01

Our cdk code remains in typescript. We will not change it to python. Read the reference article for better understanding.

Reference article:
[Which programming language is best for CDK ](https://awsmaniac.com/which-programming-language-is-the-best-for-aws-cdk/)

## Step 02

Change Runtime from NODEJS TO PYTHON in lambda function in your stack file under lib folder as we are writing our handler in python.

```javascript
const TSlambda = new lambda.Function(this, "TSLambda", {
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.fromAsset("lambda"),
      handler: "main.handler",
    });
    
```

## Step 03
We will use boto3 in our handler code. To install boto3 run following command

```python3

pip install boto3

```


## Step 04

Create a file lambda/main.py and add handler code for your lambda function

```javascript
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
        
        
```

## Step 05
Installing Bootstrap Stack. 
For Lambda functions we will need to do [bootstrapping](https://docs.aws.amazon.com/cdk/latest/guide/bootstrapping.html) becuase they require [assets](https://docs.aws.amazon.com/cdk/latest/guide/assets.html) i.e. handler code that will be bundleded with the CDK library etc. and stored in S3 bootstraped bucket:

```javascript
cdk bootstrap
```


## Step 06 (optional)

Run the following command to see the cloud formation template of your cdk code.

```javascript
cdk synth
```

## Step 07 (optional)

Run the following command to see the difference between the new changes that you just made and the code that has already been deployed on the cloud.
```javascript
cdk diff
```


## Step 08

Run the following command to deploy your code to the cloud. 

```javascript
cdk deploy
```

if you did not run "npm run watch" in the step 4 then you need to build the project before deployment by running the folliwng command. npm run build will also compile typescript files of the lambda function

```javascript
npm run build && cdk deploy
OR
yarn build && cdk deploy
```

