
# Steps to compile the code

## Step 01

Our cdk code remains in typescript. We will not change it to python. Read the reference article for better understanding.

Reference article:
[Which programming language is best for CDK ](https://awsmaniac.com/which-programming-language-is-the-best-for-aws-cdk/)

## Step 02

Change Runtime from NODEJS TO PYTHON in lambda function in your stack file under lib folder as we are writing our handler in python.

```javascript
const Lambda = new lambda.Function(this, "Pinpoint-In-Pracitce", {
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: "main.handler",
      role: role, ///Defining role to Lambda
      code: lambda.Code.fromAsset("lambda"),
      memorySize: 1024,
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
import boto3
from botocore.exceptions import ClientError


AWS_REGION = '<Region>'

SENDER_ADDRESS = "<Sender Email Address>"

APP_ID = "<APP ID>"

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

