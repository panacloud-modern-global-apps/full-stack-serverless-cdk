# AMAZON AURORA

Amazon Aurora is a MySQL and PostgreSQL-compatible relational database built for the cloud, that combines the performance and availability of traditional enterprise databases with the simplicity and cost-effectiveness of open source databases. Its up to 5 times faster than standard MySQL databases and 3 times faster than standard PostgreSQL databases. It provides the security, availability, and reliability of commercial databases at 1/10th the cost and is fully managed by Amazon Relational Database Service (RDS).
Amazon Aurora features a distributed, fault-tolerant, self-healing storage system that auto-scales up to 128TB per database instance. It delivers high performance and availability with up to 15 low-latency read replicas, point-in-time recovery, continuous backup to Amazon S3, and replication across three Availability Zones (AZs).

# AMAZON AURORA SERVERLESS

Amazon Aurora Serverless is an on-demand, auto-scaling configuration for Amazon Aurora. It automatically starts up, shuts down, and scales capacity up or down based on your application's needs. It enables you to run your database in the cloud without managing any database capacity. Manually managing database capacity can take up valuable time and can lead to inefficient use of database resources. With Aurora Serverless, you simply create a database endpoint, optionally specify the desired database capacity range, and connect your applications. You pay on a per-second basis for the database capacity you use when the database is active, and migrate between standard and serverless configurations with a few clicks in the Amazon RDS Management Console.

Aurora Serverless v1 is available for both Amazon Aurora with MySQL compatibility and Amazon Aurora with PostgreSQL compatibility. It's easy to get started: choose `Serverless` when creating your Aurora database cluster, optionally specify the desired range of database capacity, and connect your applications.


# DB Cluster

The basic building block of Amazon RDS is the DB instance. A database cluster means more than one database instances working together.


# Amazon VPC

You can run a DB instance on a virtual private cloud (VPC) using the Amazon Virtual Private Cloud (Amazon VPC) service. When you use a VPC, you have control over your virtual networking environment.

# Engine

Amazon Aurora is a MySQL and PostgreSQL-compatible relational database.

# Amazon RDS for MySql 

MySQL is the world's most popular open source relational database and Amazon RDS makes it easy to set up, operate, and scale MySQL deployments in the cloud. With Amazon RDS, you can deploy scalable MySQL servers in minutes with cost-efficient and resizable hardware capacity.

Amazon RDS for MySQL frees you up to focus on application development by managing time-consuming database administration tasks including backups, software patching, monitoring, scaling and replication.
Amazon RDS supports DB instances running several versions of MySQL.

#### Reference
[What is AWS Aurora](https://aws.amazon.com/rds/aurora/?aurora-whats-new.sort-by=item.additionalFields.postDateTime&aurora-whats-new.sort-order=desc), 
[Amazon Aurora Serverless](https://aws.amazon.com/rds/aurora/serverless/)



## Stack Code

## Step 1
install & import modules:
`"@aws-cdk/aws-rds"` ,
`"@aws-cdk/aws-secretsmanager"` ,
`"@aws-cdk/aws-iam"` ,
`@aws-cdk/aws-ec2"`.


Add the following constructs in your stack
```javascript

// step #1: create a vpc for RDS instance

   const vpc = new ec2.Vpc(this, "myrdsvpc");
  
  
 // step #2: create database cluster
 
  const myServerlessDB = new rds.ServerlessCluster(this, "ServerlessDB", {
      vpc,
      engine: rds.DatabaseClusterEngine.auroraMysql({
        version: rds.AuroraMysqlEngineVersion.VER_5_7_12,
      }),
      scaling: {
        autoPause: cdk.Duration.minutes(10), // default is to pause after 5 minutes of idle time
        minCapacity: rds.AuroraCapacityUnit.ACU_8, // default is 2 Aurora capacity units (ACUs)
        maxCapacity: rds.AuroraCapacityUnit.ACU_32, // default is 16 Aurora capacity units (ACUs)
      },
      deletionProtection: false,
      defaultDatabaseName: "mysqldb",
    });

 // step #3: give lambda permissions to access RDS and VPC from aws managed policy
 
   const role = new iam.Role(this, "LambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonRDSDataFullAccess"),
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole"
        ),
      ],
    });
    
  // step #4: create a lambda function with role and vpc to access database providing database endpoint and database credential in environmental variables. Lambda can access these through Secrets Manager too but for that lambda would require permission to access secrets manager too.
  
      const hello = new lambda.Function(this, "HelloHandler", {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.fromAsset("lambda/lambda-p.zip"),
      handler: "index.handler",
      timeout: cdk.Duration.minutes(1),
      vpc,
      role,
      environment: {
        INSTANCE_CREDENTIALS: `${
          SM.Secret.fromSecretAttributes(this, "dbcredentials", { secretArn: foo })
            .secretValue
        }`
      },
    });
    
    // step #5: create lambda once database cluster is created as we have to provide credentials
    hello.node.addDependency(myServerlessDB);
    

    
 



```

# In order to access your MySQL database locally install MySQL Client on your system or use Online Tool MySQL Workbench using clusters' endpoint(aka, host-name), database name and  password (in our case provided by AWS )



# Welcome to your CDK TypeScript project!

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

