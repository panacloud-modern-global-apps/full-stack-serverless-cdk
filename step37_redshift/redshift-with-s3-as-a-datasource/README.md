# Amazon Redshift

Amazon Redshift is a fully managed, petabyte-scale data warehouse service in the cloud. You can start with just a few hundred gigabytes of data and scale to a petabyte or more. This enables you to use your data to acquire new insights for your business and customers.

## SetUp Cluster

To set up a Redshift cluster, define a Cluster. It will be launched in a VPC. You can specify a VPC, otherwise one will be created. The nodes are always launched in private subnets and are encrypted by default.

```typescript
const vpc = new ec2.Vpc(this, "VPC");

const cluster = new redshift.Cluster(this, "RedshiftCluster", {
  masterUser: {
    masterUsername: "admin",
  },
  vpc,
  roles: [role],
});
```

By default, the master password will be generated and stored in AWS Secrets Manager.

A default database named default_db will be created in the cluster. To change the name of this database set the defaultDatabaseName attribute in the constructor properties.

By default, the cluster will not be publicly accessible. Depending on your use case, you can make the cluster publicly accessible with the publiclyAccessible property.

## Connecting to Cluster

To control who can access the cluster, use the .connections attribute. Redshift Clusters have a default port, so you don't need to specify the port:

```typescript
cluster.connections.allowFromAnyIpv4(ec2.Port.allTraffic());
```

## Give Permission to Redshift to Access S3 Objects

```typescript
const role = new Role(this, "redshift", {
  assumedBy: new ServicePrincipal("redshift.amazonaws.com"),
});

const policy = new PolicyStatement({
  effect: Effect.ALLOW,
  actions: ["s3:*", "ec2:*"],
  resources: ["*"],
});

role.addToPolicy(policy);
```

## Upload a sample data file in s3

```typescript
const myBucket = new s3.Bucket(this, "Bucket");

new s3deploy.BucketDeployment(this, "DeployFiles", {
  sources: [s3deploy.Source.asset("./data")],
  destinationBucket: myBucket,
});
```

## To Connect to cluster

- Go to Secret manager and retrieve database name and database password

- After that go to redshift -> query Editor and connect to your database using those credentials

## Create a Table in that Database

To create a Table Run

1.

```sql
CREATE SCHEMA myinternalschema

```

2.

```sql
CREATE TABLE myinternalschema.event(
name varchar(200),
age varchar(200)
city varchar(200));

```

3.

```sql

COPY myinternalschema.event FROM 's3://Uri-of-file-containing-data'
iam_role ‘REPLACE THIS PLACEHOLDER WITH THE IAM ROLE ARN'
delimiter ',' timeformat 'YYYY-MM-DD HH:MI:SS' region 'us-east-1'

```

4.  Then check your data using

```sql
SELECT * FROM myinternalschema.event
LIMIT 10;

```

# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

```

```

```

```
