from __future__ import print_function
import os
import boto3


def handler(event:dict, context):
    field = event['info']['fieldName']
    noteArray =  ['note1','note2','note3']

    if field == "notes":
       return noteArray
    elif field == "customNote":
       title = event['arguments']['title']
       return title
    else:
        print("No matched")
