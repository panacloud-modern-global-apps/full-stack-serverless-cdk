def handler(event, context):
    print(event)

    if (event['operationSuccessful']):
        print("The data was added successfully")
    else:
        print("The data was not added to the database")
