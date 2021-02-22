import boto3
import os

client = boto3.client('rds-data')


    # // Defining parameters for rdsdataservice
dbcarn = os.environ["CLUSTER_ARN"] 
print(dbcarn)
dbsarn = os.environ["SECRET_ARN"] 
print(dbsarn)

def handler(event, context):   
    data = client.execute_statement(
      resourceArn= dbcarn,
      secretArn= dbsarn,
      database="mydb",
      sql= "CREATE TABLE IF NOT EXISTS records (recordid INT PRIMARY KEY, title VARCHAR(255) NOT NULL, release_date DATE);",
)
    print(data)
    
# // //     second query

# //         "INSERT INTO records(recordid,title,release_date) VALUES(001,'Liberian Girl','2012-05-03');",
# //     

# //      data1 = client.execute_statement( 
#              resourceArn= dbcarn,
#              secretArn= dbsarn,
#              database="mydb",
#              sql= "CREATE TABLE IF NOT EXISTS records (recordid INT PRIMARY KEY, title VARCHAR(255) NOT NULL, release_date DATE);",
# )
#         print(data1)
    
    
    
# // //     third query

# //     data2 = client.execute_statement(
  # //       resourceArn= dbcarn,
# //       secretArn= dbsarn,
# //       database= "mydb",
# //       sql= "select * from records;"
# )
          # print(data2)

    return {
      "statusCode": 200,
      "headers": {},
      "body": "done",
    }
  
