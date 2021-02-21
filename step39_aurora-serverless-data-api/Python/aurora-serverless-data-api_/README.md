# [AMAZON AURORA SERVERLESS](https://github.com/panacloud-modern-global-apps/full-stack-serverless-cdk/blob/main/step38_aurora_serverless/README.md)

# AMAZON AURORA SERVERLESS DATA API 

For code that access a relational database, you open a connection, use it to process one or more SQL queries or other statements, and then close the connection. You probably used a client library that was specific to your operating system, programming language, and your database. At some point you realized that creating connections took a lot of clock time and consumed memory on the database engine, and soon after found out that you could (or had to) deal with connection pooling and other tricks.For serverless functions that are frequently invoked and that run for time intervals that range from milliseconds to minutes there is no long-running server, there’s no place to store a connection identifier for reuse.

By using the Data API for Aurora Serverless, you can work with a web-services interface to your Aurora Serverless DB cluster. The Data API doesn't require a persistent connection to the DB cluster. Instead, it provides a secure HTTP endpoint and integration with AWS SDKs. You can use the endpoint to run SQL statements without managing connections.

All calls to the Data API are synchronous. By default, a call times out if it's not finished processing within 45 seconds. However, you can continue running a SQL statement if the call times out by using the continueAfterTimeout parameter. Users don't need to pass credentials with calls to the Data API, because the Data API uses database credentials stored in AWS Secrets Manager. To store credentials in Secrets Manager, users must be granted the appropriate permissions to use Secrets Manager, an AWS managed policy, AmazonRDSDataFullAccess, includes permissions for the RDS Data API.
You can enable the Data API when you create the Aurora Serverless cluster. After you enable the Data API, you can also use the query editor for Aurora Serverless. For more information, see Using the query editor for Aurora Serverless. There is no charge for the API, but you will pay the usual price for data transfer out of AWS.

we would then use RDSDataService API for connecting to a Data API enabled Aurora Serverless database from lambda.

[Calling Data Api](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/data-api.html#data-api.calling)

## Creating Serverless Cluster with Data API Enabled

```javascript

const myServerlessDB = new rds.ServerlessCluster(this, "Database", {
  engine: rds.DatabaseClusterEngine.aurora({
    version: rds.AuroraEngineVersion.VER_1_22_2,
  }),
  vpc,
  scaling: {
    autoPause: cdk.Duration.minutes(10), // default is to pause after 5 minutes of idle time
    minCapacity: rds.AuroraCapacityUnit.ACU_8, // default is 2 Aurora capacity units (ACUs)
    maxCapacity: rds.AuroraCapacityUnit.ACU_32, // default is 16 Aurora capacity units (ACUs)
  },
  // enable data api
  enableDataApi: true,
  deletionProtection: false,
  defaultDatabaseName: "mydb",
});

// either use "enable-data-api" in cluster construct or this to give acces to lambda function named "hello"
// myServerlessDB.grantDataApiAccess(hello);
```


