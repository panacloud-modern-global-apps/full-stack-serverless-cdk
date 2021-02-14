## AMAZON NEPTUNE

Amazon Neptune is a fast, reliable, fully managed graph database service that makes it easy to build and run applications that work with highly connected datasets. The core of Amazon Neptune is a purpose-built, high-performance graph database engine optimized for storing billions of relationships and querying the graph with milliseconds latency. Amazon Neptune supports popular graph models Property Graph and W3C's RDF, and their respective query languages Apache TinkerPop Gremlin and SPARQL, allowing you to easily build queries that efficiently navigate highly connected datasets. Neptune powers graph use cases such as recommendation engines, fraud detection, knowledge graphs, drug discovery, and network security.

Amazon Neptune is highly available, with read replicas, point-in-time recovery, continuous backup to Amazon S3, and replication across Availability Zones. Neptune is secure with support for HTTPS encrypted client connections and encryption at rest. Neptune is fully managed, so you no longer need to worry about database management tasks such as hardware provisioning, software patching, setup, configuration, or backups.

[Find out more about aws neptune here](https://aws.amazon.com/neptune/)

- Amazon Neptune use gremlin as its query language. [You can find out more about gremlin here](https://tinkerpop.apache.org/gremlin.html)

- [Learn Gremlin](https://docs.janusgraph.org/basics/gremlin/)

## Code Explanation

- Create s3 bucket to load sample data and deploy the data

```typescript
const myBucket = new s3.Bucket(this, "myBucket", {
  versioned: true,
});

new s3deploy.BucketDeployment(this, "DeployFiles", {
  sources: [s3deploy.Source.asset("./sampleData")],
  destinationBucket: myBucket,
});
```

- Configure role for ec2

```typescript
const role = new iam.Role(this, "MyEc2", {
  assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
});

const policy = new iam.PolicyStatement({
  effect: iam.Effect.ALLOW,
  actions: [
    "s3:*",
    "logs:*",
    "lambda:*",
    "cloudformation:*Stack",
    "ec2:*",
    "rds:*",
    "iam:*",
    "ssm:GetParameters",
  ],
  resources: ["*"],
});

role.addToPolicy(policy);
```

- Create A Vpc and configure EC2 Instance. These configurations are selected because it fall under free tier

```typescript
const vpc = new ec2.Vpc(this, "MyVpc", {
  maxAzs: 2,
  subnetConfiguration: [
    {
      subnetType: ec2.SubnetType.PUBLIC,
      name: "Public",
    },
  ],
  enableDnsHostnames: true,
  enableDnsSupport: true,
});

const amazonLinux = ec2.MachineImage.latestAmazonLinux({
  generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
  edition: ec2.AmazonLinuxEdition.STANDARD,
  virtualization: ec2.AmazonLinuxVirt.HVM,
  storage: ec2.AmazonLinuxStorage.EBS,
});

new ec2.Instance(this, "MyInstance", {
  instanceType: new ec2.InstanceType("t2.micro"),
  machineImage: amazonLinux,
  vpc,
  keyName: "my-ec2-key",
  role,
});
```

- Configure role for aws neptune. This will be used in the later section

```typescript
const roleA = new iam.Role(this, "MyEc2", {
  assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
});

const policyA = new iam.PolicyStatement({
  effect: iam.Effect.ALLOW,
  actions: [
    "s3:*",
    "logs:*",
    "lambda:*",
    "cloudformation:*Stack",
    "ec2:*",
    "rds:*",
    "iam:*",
    "ssm:GetParameters",
  ],
  resources: ["*"],
});

roleA.addToPolicy(policyA);
```

- Configure Security Group and Subnet group for aws neptune so that it could be deployed in the same vpc as ec2

```typescript
const sg1 = new ec2.SecurityGroup(this, "mySecurityGroup1", {
  vpc,
  allowAllOutbound: true,
  description: "security group 1",
  securityGroupName: "mySecurityGroup",
});
cdk.Tags.of(sg1).add("Name", "mySecurityGroup");

sg1.addIngressRule(sg1, ec2.Port.tcp(8182), "MyRule");

const neptuneSubnet = new neptune.CfnDBSubnetGroup(this, "neptuneSubnetGroup", {
  dbSubnetGroupDescription: "My Subnet",
  subnetIds: vpc.selectSubnets({ subnetType: ec2.SubnetType.PUBLIC }).subnetIds,
  dbSubnetGroupName: "mysubnetgroup",
});
```

- Create Neptune Cluster and db Insance. Again this configuration will help you minimize the cost of aws neptune

```typescript
const neptuneCluster = new neptune.CfnDBCluster(this, "MyCluster", {
  dbSubnetGroupName: neptuneSubnet.dbSubnetGroupName,
  dbClusterIdentifier: "myDbCluster",
  vpcSecurityGroupIds: [sg1.securityGroupId],
});
neptuneCluster.addDependsOn(neptuneSubnet);

const neptuneInstance = new neptune.CfnDBInstance(this, "myinstance", {
  dbInstanceClass: "db.t3.medium",
  dbClusterIdentifier: neptuneCluster.dbClusterIdentifier,
  availabilityZone: vpc.availabilityZones[0],
});
neptuneInstance.addDependsOn(neptuneCluster);
```

### Steps to configure AWS Neptune in EC2

#### Step 1

- Connect to Your instance
- [Connect on Linux](https://docs.amazonaws.cn/en_us/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html) -[Connect on Windows](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/putty.html)

#### Step 2

- Export temporary aws credentials on EC2. [Create temporary Credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html#using-temp-creds-sdk-cli)

```
export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
export AWS_SESSION_TOKEN=AQoDYXdzEJr1K...o5OytwEXAMPLE=`

```

#### Step 3

- Install Gremlin on EC2 instance
  [Install Gremlin Console from here](https://docs.aws.amazon.com/neptune/latest/userguide/access-graph-gremlin-console.html)

#### Step 4

- Go to AWS Neptune Console. Click on your database cluster. Under Action options you will find Manage Iam Permissions.
- Add the Iam role that you create using your stack and apply the role. This will take some time

#### Step 5

- Create a VPC Endpoint to allow s3 to access aws neptune resources
- [You can create vpc endpoint from here](https://docs.aws.amazon.com/neptune/latest/userguide/bulk-load-tutorial-IAM.html)
- Make sure that select your stack vpc and click all the route table options
- Alternatively you can also create the endpoint by specifying in the stack like

```typescript
vpc.addGatewayEndpoint("gwep", {
  service: GatewayVpcEndpointAwsService.S3,
});
```

#### Step 6

- Now go to EC2 dashboard and under security group add following rule on your main security group which is created automatically
  ![Inbound rules](https://github.com/panacloud-modern-global-apps/full-stack-serverless-cdk/raw/main/step51_greengrassv2/img/inbound_rules.png)

- Now go the security group that you created with name mySecurityGroup and add the inbound rule
- To add inbound rule click on the inboud rules > edit
- Next add rule and fill the field with following configuration
  Type -> Custom TCP
  Protocol -> TCP
  Port Range -> 8182
  Source -> Custom and add the security group id of your main security group
  Now Save

#### Step 7

- Run the following command from your EC2 instance

```
curl -X POST \
    -H 'Content-Type: application/json' \
    https://your-neptune-endpoint:port/loader -d '
    {
      "source" : "s3://bucket-name/object-key-name",
      "format" : "format",
      "iamRoleArn" : "arn:aws:iam::account-id:role/role-name",
      "region" : "region",
      "failOnError" : "FALSE",
      "parallelism" : "MEDIUM",
      "updateSingleCardinalityProperties" : "FALSE",
      "queueRequest" : "TRUE",
    }'
```

#### Step 8

- Now run

```
cd {your apache-tinker-folder}

bin/gremlin.sh
```

- Gremlin console will pop up and now run the gremlin queries

- Sample queries

```
1. gremlin> g.V().label().groupCount()

===> {continent=7, country=237, version=1, airport=3437}

2. gremlin> g.V().has('code', 'ORD').valueMap(true)

==>{country=[US], code=[ORD], longest=[13000], id=18, city=[Chicago], lon=[-87.90480042], type=[airport], elev=[672], icao=[KORD], region=[US-IL], runways=[7], lat=[41.97859955], desc=[Chicago O'Hare International Airport], label=airport}
```

[You can find more queries here](https://www.sungardas.com/en-us/cto-labs-blog/a-beginners-walkthrough-for-building-and-querying-aws-neptune-with-gremlin/)

### Some other useful links

-[Use Lambda with Gremlin](https://docs.aws.amazon.com/neptune/latest/userguide/lambda-functions.html) -[Generate Graph](https://aws.amazon.com/blogs/database/let-me-graph-that-for-you-part-1-air-routes/)

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
