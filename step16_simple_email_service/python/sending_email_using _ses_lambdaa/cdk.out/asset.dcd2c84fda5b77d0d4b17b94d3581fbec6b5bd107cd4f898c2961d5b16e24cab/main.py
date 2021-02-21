import json
import boto3

def handler(event, context):
    print("eve",event)
    print("con",context)
    
    client = boto3.client('ses')
    SUBJECT = "Amazon SES Message"
    BODY_TEXT = ("Amazon SES (Python)\r\n"
             "This email was sent with Amazon SES using the "
             "AWS SDK for Python (Boto)."
            )
            
    message = {"Subject": { "Data": SUBJECT} , "Body": {"Html": {"Data": BODY_TEXT}}}
    response = client.send_email(Source = "xxxx@gmail.com", Destination = {"ToAddresses":["xxxx@gmail.com"]}, Message = message)
    
    return {
        'statusCode': 200,
        'body': response
    }