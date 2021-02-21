import json


def handler(event):
    print('Received Event: {}'.format(json.dumps(event['Records'][0]['Sns'])))
    Success = event['Records'][0]['Sns']['Message']
    print(Success)
    if Success:
        print("Success")
        return {
            'success': True,
            'Message': "Hello World from SNS"
        }
    print('Failure')
