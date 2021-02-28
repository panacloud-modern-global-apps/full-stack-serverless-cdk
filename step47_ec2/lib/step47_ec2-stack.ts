import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import { KeyPair } from 'cdk-ec2-key-pair';

export class Step47Ec2Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    // Create the Key Pair
    const key = new KeyPair(this, 'A-Key-Pair', {
      name: 'a-key-pair',
      description: 'This is a Key Pair',
      storePublicKey: true, // by default the public key will not be stored in Secrets Manager
    });

    // Create new VPC
    const vpc = new ec2.Vpc(this, 'VPC', {
      subnetConfiguration: [
        {
          cidrMask: 26,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        }
      ]
    });

    // Open port 22 for SSH connection from anywhere
    const mySecurityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc,
      securityGroupName: "my-test-sg",
      description: 'Allow ssh access to ec2 instances from anywhere',
      allowAllOutbound: true
    });
    mySecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'allow public ssh access')

    // We are using the latest AMAZON LINUX AMI
    const awsAMI = new ec2.AmazonLinuxImage({ generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2 });


    // Instance details
    //use instance class T2 and instance size micro coz it's in free tier 
    new ec2.Instance(this, 'Instance', {
      keyName: key.keyPairName,
      instanceName: 'mkk-ec2-instance', //optional
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: awsAMI,
      securityGroup: mySecurityGroup
    });
  }
}