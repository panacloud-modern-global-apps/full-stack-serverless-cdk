import requests
import json
import randomName

def handler(event, context):    

    name = randomName.getName()    
    result = requests.get('https://jsonplaceholder.typicode.com/todos/1')    
    
    print("Random Name ==>", name)
    print("Random Fetch ==>", result.json())

    return {
        'statusCode': 200,
        'headers': { "Content-Type": "application/json" },
        'body': {
            'randomName': name,
            'randomFetch': result.json(),
        },
    }

 

