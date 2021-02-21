import json
import random
import string


def lambda_handler(event, context):
    # print(event)
    # print(context)
    
    letters = string.ascii_lowercase
    value = ''.join(random.choice(letters) for i in range(10)) 

    return {
        'statusCode': 200,
        "headers":  json.dumps({ 'Access-Control-Allow-Origin': '*' }),
         "body": json.dumps(value) 
    }

