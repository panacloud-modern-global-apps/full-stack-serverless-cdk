import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from "@aws-cdk/aws-iam";

export class AwsFargateStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'MyVPC', { maxAzs: 2 });
    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: vpc,
      containerInsights: true
    });

    const taskrole = new iam.Role(this, "ecsTaskExecutionRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });

    taskrole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AmazonECSTaskExecutionRolePolicy"
      )
    );


    const fargateTaskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
      taskRole: taskrole
    });

    

    const container = fargateTaskDefinition.addContainer("WebContainer", {
      // Use an image from DockerHub
      //ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample") use this for default img provided by aws for testing.
      image: ecs.ContainerImage.fromAsset(__dirname + '/../local-image'), // this image will be built and uploaded to ECR.
      
    });

    container.addPortMappings({
      containerPort: 80, //open port 80 to visit website
      hostPort: 80
    })

    const securityGroup = new ec2.SecurityGroup(this, 'webContainer', { 
      vpc, 
      allowAllOutbound: true, // allow container to traffic and to send request to ECR 
    });
    // edit inbound rules to allow all traffic to port 80
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80))


    //create service for the fargate task
    const fargateService = new ecs.FargateService(this, 'webService', { 
      cluster,
      taskDefinition: fargateTaskDefinition,
      assignPublicIp: true,
      securityGroup,
      desiredCount: 1 // default is 1
    })


    // auto scaling(optional)
    const scaling = fargateService.autoScaleTaskCount({
      maxCapacity: 2
    })

    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 10, // 10 is good for testing for production 75 and above would be appropriate
      scaleInCooldown: cdk.Duration.seconds(60), //Scale-in cooldown period
      scaleOutCooldown: cdk.Duration.seconds(60)
    });
    
  
  
  }
}
