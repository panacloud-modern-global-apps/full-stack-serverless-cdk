import * as cdk from "@aws-cdk/core";
import * as redshift from "@aws-cdk/aws-redshift";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import {
  Effect,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "@aws-cdk/aws-iam";

export class RedshiftS3Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // Creating a s3 bucket
    const myBucket = new s3.Bucket(this, "Bucket");

    // Upload file in s3 bucket
    new s3deploy.BucketDeployment(this, "DeployFiles", {
      sources: [s3deploy.Source.asset("./data")],
      destinationBucket: myBucket,
    });

    //providing rights to redshift to access dynamodb elements
    const role = new Role(this, "redshift", {
      assumedBy: new ServicePrincipal("redshift.amazonaws.com"),
    });

    ///Attaching S# access to policy
    const policy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:*", "ec2:*"],
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
