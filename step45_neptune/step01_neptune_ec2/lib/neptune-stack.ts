import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as iam from "@aws-cdk/aws-iam";
import * as neptune from "@aws-cdk/aws-neptune";

export class NeptuneStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // Create a website bucket to load sample data
    const myBucket = new s3.Bucket(this, "myBucket", {
      versioned: true,
    });

    // Deploy sample Data files
    new s3deploy.BucketDeployment(this, "DeployFiles", {
      sources: [s3deploy.Source.asset("./sampleData")],
      destinationBucket: myBucket,
    });

    // Create an Iam role for ec2 so that it could access s3 and iam
    const role = new iam.Role(this, "MyEc2", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    });

    // Create policy for ec2 role
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

    //granting IAM permissions to role
    role.addToPolicy(policy);

    // Create a VPC to configure ec2 instance and aws neptune database
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

    // Machine image for ec2 instance. This config is best suited for free tier
    const amazonLinux = ec2.MachineImage.latestAmazonLinux({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      edition: ec2.AmazonLinuxEdition.STANDARD,
      virtualization: ec2.AmazonLinuxVirt.HVM,
      storage: ec2.AmazonLinuxStorage.EBS,
    });

    // launch the instance with the following configuration and make sure to download the key-pair from ec2 dashboard before deploying the code
    new ec2.Instance(this, "MyInstance", {
      instanceType: new ec2.InstanceType("t2.micro"),
      machineImage: amazonLinux,
      vpc,
      keyName: "my-ec2-key",
      role,
    });

    // Create role for aws neptune
    const roleA = new iam.Role(this, "Myneptune", {
      assumedBy: new iam.ServicePrincipal("rds.amazonaws.com"),
    });

    // Configure policy for aws neptune so that it could access s3
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

    //granting IAM permissions to role
    roleA.addToPolicy(policyA);

    // Create a security group and subnetgroup to ensure ec2 and neptune cluster deploy on the same vpc
    const sg1 = new ec2.SecurityGroup(this, "mySecurityGroup1", {
      vpc,
      allowAllOutbound: true,
      description: "security group 1",
      securityGroupName: "mySecurityGroup",
    });
    cdk.Tags.of(sg1).add("Name", "mySecurityGroup");

    sg1.addIngressRule(sg1, ec2.Port.tcp(8182), "MyRule");

    const neptuneSubnet = new neptune.CfnDBSubnetGroup(
      this,
      "neptuneSubnetGroup",
      {
        dbSubnetGroupDescription: "My Subnet",
        subnetIds: vpc.selectSubnets({ subnetType: ec2.SubnetType.PUBLIC })
          .subnetIds,
        dbSubnetGroupName: "mysubnetgroup",
      }
    );

    // Creating neptune cluster
    const neptuneCluster = new neptune.CfnDBCluster(this, "MyCluster", {
      dbSubnetGroupName: neptuneSubnet.dbSubnetGroupName,
      dbClusterIdentifier: "myDbCluster",
      vpcSecurityGroupIds: [sg1.securityGroupId],
    });
    neptuneCluster.addDependsOn(neptuneSubnet);

    // Creating neptune instance
    const neptuneInstance = new neptune.CfnDBInstance(this, "myinstance", {
      dbInstanceClass: "db.t3.medium",
      dbClusterIdentifier: neptuneCluster.dbClusterIdentifier,
      availabilityZone: vpc.availabilityZones[0],
    });
    neptuneInstance.addDependsOn(neptuneCluster);
  }
}
