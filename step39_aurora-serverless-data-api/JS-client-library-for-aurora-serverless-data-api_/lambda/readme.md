# Data Api Client

The Data API Client is a lightweight wrapper that simplifies working with the Amazon Aurora Serverless Data API by abstracting away the notion of field values.
This abstraction annotates native JavaScript types supplied as input parameters, as well as converts annotated response data to native JavaScript types.
It's basically a DocumentClient for the Data API. It also promisifies the AWS.RDSDataService client to make working with async/await or Promise chains easier
AND dramatically simplifies transactions.

# Why do I need this?

The Data API requires you to specify data types when passing in parameters. 
Specifying all of those data types in the parameters is a bit clunky. In addition to requiring types for parameters, it also returns each field as an object
with its value assigned to a key that represents its data type.

# Installation and Setup

npm i data-api-client

# For more information

[Data Api Client](https://github.com/jeremydaly/data-api-client) 
