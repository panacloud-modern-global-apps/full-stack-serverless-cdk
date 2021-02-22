import boto3
import json
import os
import logging
from botocore.exceptions import ClientError
sns = boto3.client('sns')

def handler(event, context):  
    print(event)
    if event["operationSuccessful"] == False:
        return json.dumps({ "message": "operation not successful" })
 

    try:
        if event["SnsMessage"]:
            #  sending message to TOPIC ARN
            sns.publish(
                TopicArn= os.environ["SNS_TOPIC_ARN"],
                Message= event["SnsMessage"],
            )
            print('message published')

            #  sending message to Phone Number
            sns.publish(
                Message= event["SnsMessage"],
                PhoneNumber = "+920020394066"
                # PhoneNumber=os.environ["PHONE_NUMBER"],
            )
            print('message sent to Phone.no:', os.environ["PHONE_NUMBER'})
    
    except ClientError as e:
        logging.error(e)
        print("error", e)
        print("ERROR Publishing To SNS ")

    return json.dumps({ "message": "operation successful" })


