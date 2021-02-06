import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";

export class Greengrassv2Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // configure a vpc to access public Ip. This would incur cost for running public natgaeway.
    const vpc = new ec2.Vpc(this, "MyVpc", {
      subnetConfiguration: [
        {
          subnetType: ec2.SubnetType.PUBLIC,
          name: "Public",
        },
      ],
    });

    // set up amazon linux container to run your greengrass components
    const amazonLinux = ec2.MachineImage.latestAmazonLinux({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      edition: ec2.AmazonLinuxEdition.STANDARD,
      virtualization: ec2.AmazonLinuxVirt.HVM,
      storage: ec2.AmazonLinuxStorage.EBS,
    });

    // launch the instance with the following configuration
    new ec2.Instance(this, "MyInstance", {
      instanceType: new ec2.InstanceType("t2.micro"),
      machineImage: amazonLinux,
      vpc,
      keyName: "my-ec2-key",
    });
  }
}
