import * as cdk from "@aws-cdk/core";
import * as rds from "@aws-cdk/aws-rds";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as lambda from "@aws-cdk/aws-lambda";
import * as SM from "@aws-cdk/aws-secretsmanager";
import * as iam from "@aws-cdk/aws-iam";

export class BackStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    //  create vpc for the databace instance

    const vpc = new ec2.Vpc(this, "myrdsvpc");

    //  create database instance

    const myDBInstance = new rds.DatabaseInstance(this, "MySQL", {
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE3,
        ec2.InstanceSize.SMALL
      ),
      vpc,
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_5_6_39,
      }),
      publiclyAccessible: true,
      multiAz: false,
      allocatedStorage: 100,
      storageType: rds.StorageType.STANDARD,
      cloudwatchLogsExports: ["audit", "error", "general"],
      databaseName: "mySqlDataBase",
      deletionProtection: false,
      vpcPlacement: { subnetType: ec2.SubnetType.PUBLIC },
    });

    //  for lambda RDS and VPC access
    const role = new iam.Role(this, "LambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonRDSDataFullAccess"),
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole"
        ),
      ],
    });

  
    const dbcreds = myDBInstance.secret?.secretArn || "dbcreds";

    //  create a function to access database 
    const hello = new lambda.Function(this, "HelloHandler", {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.fromAsset("lambda/lambdazip.zip"),
      handler: "index.handler",
      timeout: cdk.Duration.minutes(1),
      vpc,
      role,
      environment: {
         INSTANCE_CREDENTIALS: `${
          SM.Secret.fromSecretAttributes(this, "dbcredentials", { secretArn: dbcreds })
            .secretValue
        }`,
        HOST: myDBInstance.dbInstanceEndpointAddress,
      },
    });

    //  create lambda once dbinstance is created 
    hello.node.addDependency(myDBInstance);

    //  allow lambda to connect to the database instance

    myDBInstance.grantConnect(hello);
    // To control who can access the cluster or instance, use the .connections attribute. RDS databases have a default port: 3306
   myDBInstance.connections.allowFromAnyIpv4(ec2.Port.tcp(3306))
    

}};


