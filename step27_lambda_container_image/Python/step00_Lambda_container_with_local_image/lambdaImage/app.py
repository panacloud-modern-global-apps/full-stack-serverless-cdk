# import sys
import names

def handler(event, context):
    print(event)
    new = names.get_full_name(gender='male')
    return new        

    
  
