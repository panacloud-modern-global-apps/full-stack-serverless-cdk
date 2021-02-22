# import { randomBytes } from 'crypto';
import boto3
import os
import secrets
import json
from botocore.exceptions import ClientError
dynamodb = boto3.resource('dynamodb')
table = os.environ['DYNAMO_TABLE_NAME']
dbtable= dynamodb.Table(table)

def handler(event, context):

    print(event)
    returningPayload = json.dumps({ "operationSuccessful" : True })
    try:
        # ///  adding new time slot ////
        if event["detail-type"] == "addTimeSlot":
            res = dbtable.put_item(
                Item= { "id" : secrets.token_hex(16), **event['detail'], "isBooked" : False },
               )
            print(json.dumps(res))

        # ///  deleting time slot ///// 
        if event["detail-type"] == "deleteTimeSlot":
            res = dbtable.delete_item(
               Key={ 'id': event['detail']['id'] }
            )
            print(json.dumps(res)) 

        #  ////  adding booking time slot request ////
        if event["detail-type"] == "addBookingRequest":
            res = dbtable.update_item(
                  Key={ "id": event['detail']['id'] },
                  UpdateExpression= "set isBookingRequested = :booleanValue, bookingRequestBy = :userName",
                 ExpressionAttributeValues= {
                    ":booleanValue": True,
                    ":userName": event['detail']['userName']
                },
                ReturnValues= "UPDATED_NEW" 
            )
            returningPayload= json.dumps({ "SnsMessage" : 'Request of booking timeSlot', "operationSuccessful" : True  })
  
            print(json.dumps(res)) 

        # ////  deleting booking time slot request ///  
        if event["detail-type"] == "deleteBookingRequest":
            res = dbtable.update_item(
                Key= { "id": event['detail']['id'] },
                UpdateExpression= "set isBookingRequested = :booleanValue, bookingRequestBy = :userName",
                ExpressionAttributeValues= {
                    ":booleanValue": False,
                    ":userName": ''
                },
                ReturnValues= "UPDATED_NEW"  )
            returningPayload= json.dumps({ "SnsMessage" : 'Request of booking timeSlot', "operationSuccessful" : True  })

            print(json.dumps(res)) 

        #/////  canceling booked time slot ///// 
        if event["detail-type"] == "cancelBooking":
            res = dbtable.update_item(

                Key= { "id": event['detail']['id'] },
                UpdateExpression= "set isBooked = :_isBooked, bookedBy = :_bookedBy",
                ExpressionAttributeValues= {
                    ":_isBooked": False,
                    ":_bookedBy": "",
                },
                ReturnValues= "UPDATED_NEW"   )
            returningPayload= json.dumps({ "SnsMessage" : 'Request of canceling timeSlot', "operationSuccessful" : True  })    

            print(json.dumps(res)) 

        # ////  canceling all booked time slots ////
        if event["detail-type"] == "resetAllBookings":
            res = dbtable.scan()
            data = res['Items']
            print(data)
            for d in data:
                # print("ID ===>> ", d["id"])
                output = dbtable.update_item(
                    Key= { "id": d["id"] },
                    UpdateExpression= "set isBooked = :_isBooked, bookedBy = :_bookedBy, isBookingRequested = :_isBookingRequested, bookingRequestBy = :_bookingRequestBy",
                    ExpressionAttributeValues={
                        ":_isBooked": False,
                        ":_bookedBy": "",
                        ":_isBookingRequested": False,
                        ":_bookingRequestBy": ""
                    },
                    ReturnValues= "NONE" 
                )
                print(json.dumps(output))  

        # /////  booking time slot ///////
        if event["detail-type"] == "bookTimeSlot":
            data1 = dbtable.get_item(
                Key= { 'id': event['detail']['id'] },
                AttributesToGet= ["isBookingRequested", "bookingRequestBy"]
            )
            print(data1)
            if data1['Item']['isBookingRequested'] == True:
                res = dbtable.update_item(
                    Key= { "id": event['detail']['id'] },
                    UpdateExpression="set isBooked = :_isBooked, bookedBy = :_bookedBy, isBookingRequested = :_isBookingRequested, bookingRequestBy = :_bookingRequestBy",
                     ExpressionAttributeValues= {
                        ":_isBooked": True,
                        ":_bookedBy": data['Item']['bookingRequestBy'], 
                        ":_isBookingRequested": False,
                        ":_bookingRequestBy": ""
                    },
                     ReturnValues= "UPDATED_NEW" 
                )
                print(res)
                print(json.dumps(res))
                returningPayload= json.dumps({ "SnsMessage" : 'Request of booking timeSlot', "operationSuccessful" : True  }) 
        
              
        print("returning payload", returningPayload)
        return returningPayload;
       
    except ClientError as  e:
        print(e)
        returningPayload['operationSuccessful'] = False
        return returningPayload
        
    



