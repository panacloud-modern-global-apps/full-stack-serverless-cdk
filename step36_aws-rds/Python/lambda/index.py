# pip install mysql-connector-python
import os
import mysql.connector
import json

value = os.environ["INSTANCE_CREDENTIALS"]
vall = json.loads(value)
print(vall)

#  Require and initialize outside of your main handler
mydb = mysql.connector.connect(
  host= os.environ["HOST"],
  user="admin",
  database= vall["dbname"],
  password= vall["password"],
)
# const mysql = require("serverless-mysql")({
#   config: {
#     host: env.HOST,
#     database: envvalue.dbname,
#     user: "admin",
#     password: envvalue.password,
#   },
# });

def handler(event, context):
 
    mycursor = mydb.cursor()

    # #  Simple query
    mycursor.execute(
      "CREATE TABLE IF NOT EXISTS new (task_id INT AUTO_INCREMENT, description TEXT, PRIMARY KEY (task_id))" )
    

    # // first query
    # // "CREATE TABLE IF NOT EXISTS new (task_id INT AUTO_INCREMENT, description TEXT, PRIMARY KEY (task_id))"
   
   
    # // second query
    # Important!: Notice the statement: mydb.commit(). It is required to make the changes, otherwise no changes are made to the table.
    # // "insert into new (task_id, description) values(20,'complete the project')",
    # mydb.commit()
    # print(mycursor.rowcount, "row count")

     # // third query
    # // "SELECT * FROM new"
    # myresult = mycursor.fetchall()
    #   for x in myresult:
    #     print(x)

    return {
      'statusCode': 200,
      'headers' : json.dumps({ "Content-Type": "text/plain" }),
      'body': "done"
    }

