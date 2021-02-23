import requests
import json

def handler(event, context):        
    result = requests.get('https://jsonplaceholder.typicode.com/todos/1')    
    print(result.json())    
    #text = json.dumps(result.json(), sort_keys=True, indent=4)
    return result.json()
