from __future__ import print_function
import logging
import os
import json

msg_file_path = '/mnt/msg/content'


def handler(event, context):
    # request = event['requestContext']
    # http = request['http']
    method = event['requestContext']['http']['method']
    if method == 'GET':
        return getMessages()
    elif method == 'POST':
        message = json.loads(event['body'])
        return createMessages(message)
    elif method == 'DELETE':
        return deleteMessages()
    else:
        return {'message': 'method not supported'}


def getMessages():
    try:
        file = open(msg_file_path, 'r')
        file_text = file.read()
        return {'File_Text': file_text}
    except:
        logging.error('unable to read')
        return {'message': 'unable to load information'}


def deleteMessages():
    try:
        os.remove(msg_file_path)
        return {'message': 'File Deleted'}
    except:
        logging.error('unable to delete')
        return {'message': 'unable to load information'}


def createMessages(message):
    try:
        file = open(msg_file_path, 'a')
        file.write(message)
        return {'appended_text': message}
    except:
        logging.error('unable to write to the file')
        return {'message': 'unable to load information'}
