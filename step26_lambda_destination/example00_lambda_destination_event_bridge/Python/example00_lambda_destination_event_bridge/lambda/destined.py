import json


def handler(event):
    print('request: {}'.format(json.dumps(event)))
    return {
        'source': 'event-success',
        'action': 'data',
        'data': "Hello world"
    }