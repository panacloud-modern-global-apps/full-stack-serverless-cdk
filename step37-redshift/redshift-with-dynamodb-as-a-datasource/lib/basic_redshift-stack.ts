import * as cdk from "@aws-cdk/core";
import * as redshift from "@aws-cdk/aws-redshift";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ddb from "@aws-cdk/aws-dynamodb";
import {
  Effect,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "@aws-cdk/aws-iam";

export class BasicRedshiftStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    // create a dynamodb table
    const lollyTable = new ddb.Table(this, "lollyTable", {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    });

    //providing rights to redshift to access dynamodb elements
    const role = new Role(this, "redshift", {
      assumedBy: new ServicePrincipal("redshift.amazonaws.com"),
    });

    ///Attaching DynamoDb access to policy
    const policy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["dynamodb:*", "ec2:*"],
      resources: ["*"],
    });

    //granting IAM permissions to role
    role.addToPolicy(policy);

    // creating a vpc for redshift cluster
    const vpc = new ec2.Vpc(this, "VPC");

    const cluster = new redshift.Cluster(this, "RedshiftCluster", {
      masterUser: {
        masterUsername: "admin",
      },
      vpc,
      roles: [role],
    });

    // granting permission to access from anyport
    cluster.connections.allowFromAnyIpv4(ec2.Port.allTraffic());
  }
}
