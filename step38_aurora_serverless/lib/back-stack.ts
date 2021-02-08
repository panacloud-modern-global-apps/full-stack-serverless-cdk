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

    //  create database cluster

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

    const secarn = myServerlessDB.secret?.secretArn || "secret-arn";

    //  create a function to access database
    const hello = new lambda.Function(this, "HelloHandler", {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.fromAsset("lambda/lambda-p.zip"),
      handler: "index.handler",
      timeout: cdk.Duration.minutes(1),
      vpc,
      role,
      environment: {
        val: `${
          SM.Secret.fromSecretAttributes(this, "sec-arn", { secretArn: secarn })
            .secretValue
        }`,
      },
    });

    //  create lambda once dbinstance is created
    hello.node.addDependency(myServerlessDB);
    
//      connection
      myServerlessDB.connections.allowFromAnyIpv4('Open to the world');
  }
}
