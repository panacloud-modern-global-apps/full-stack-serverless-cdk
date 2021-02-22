import json


def handler(event):
    print('request: {}'.format(json.dumps(event)))
