import * as cdk from '@aws-cdk/core';
import * as elbv2 from "@aws-cdk/aws-elasticloadbalancingv2";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecr from "@aws-cdk/aws-ecr";
import * as iam from "@aws-cdk/aws-iam";
import * as logs from "@aws-cdk/aws-logs";


export class FargateAlbPathBasedRoutingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "ProducerVPC");

    // ECS Cluster
    const cluster = new ecs.Cluster(this, "Fargate Cluster", {
      vpc: vpc,
    });



    // Task Role
    const taskrole = new iam.Role(this, "ecsTaskExecutionRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });

    taskrole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AmazonECSTaskExecutionRolePolicy"
      )
    );

    // Task Definitions
    const bookServiceTaskDefinition = new ecs.FargateTaskDefinition(
      this,
      "bookServiceTaskDef",
      {
        memoryLimitMiB: 512,
        cpu: 256,
        taskRole: taskrole,
      }
    );

    const authorServiceTaskDefinition = new ecs.FargateTaskDefinition(
      this,
      "authorServiceTaskDef",
      {
        memoryLimitMiB: 512,
        cpu: 256,
        taskRole: taskrole,
      }
    );

    // Log Groups
    const bookServiceLogGroup = new logs.LogGroup(this, "bookServiceLogGroup", {
      logGroupName: "/ecs/BookService",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const authorServiceLogGroup = new logs.LogGroup(
      this,
      "authorServiceLogGroup",
      {
        logGroupName: "/ecs/AuthorService",
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );

    const bookServiceLogDriver = new ecs.AwsLogDriver({
      logGroup: bookServiceLogGroup,
      streamPrefix: "BookService",
    });

    const authorServiceLogDriver = new ecs.AwsLogDriver({
      logGroup: authorServiceLogGroup,
      streamPrefix: "AuthorService",
    });

    // Amazon ECR Repositories
    const bookservicerepo = ecr.Repository.fromRepositoryName(
      this,
      "bookservice",
      "book-service"
    );

    const authorservicerepo = ecr.Repository.fromRepositoryName(
      this,
      "authorservice",
      "author-service"
    );

    // Task Containers
    const bookServiceContainer = bookServiceTaskDefinition.addContainer(
      "bookServiceContainer",
      {
        image: ecs.ContainerImage.fromEcrRepository(bookservicerepo),
        logging: bookServiceLogDriver,
      }
    );

    const authorServiceContainer = authorServiceTaskDefinition.addContainer(
      "authorServiceContainer",
      {
        image: ecs.ContainerImage.fromEcrRepository(authorservicerepo),
        logging: authorServiceLogDriver,
      }
    );

    bookServiceContainer.addPortMappings({
      containerPort: 80,
    });

    authorServiceContainer.addPortMappings({
      containerPort: 80,
    });

    //Security Groups
    const bookServiceSecGrp = new ec2.SecurityGroup(
      this,
      "bookServiceSecurityGroup",
      {
        allowAllOutbound: true,
        securityGroupName: "bookServiceSecurityGroup",
        vpc: vpc,
      }
    );

    bookServiceSecGrp.connections.allowFromAnyIpv4(ec2.Port.tcp(80));

    const authorServiceSecGrp = new ec2.SecurityGroup(
      this,
      "authorServiceSecurityGroup",
      {
        allowAllOutbound: true,
        securityGroupName: "authorServiceSecurityGroup",
        vpc: vpc,
      }
    );

    authorServiceSecGrp.connections.allowFromAnyIpv4(ec2.Port.tcp(80));

    // Fargate Services
    const bookService = new ecs.FargateService(this, "bookService", {
      cluster: cluster,
      taskDefinition: bookServiceTaskDefinition,
      assignPublicIp: false,
      desiredCount: 1,
      securityGroup: bookServiceSecGrp,
    });

    const authorService = new ecs.FargateService(this, "authorService", {
      cluster: cluster,
      taskDefinition: authorServiceTaskDefinition,
      assignPublicIp: false,
      desiredCount: 1,
      securityGroup: authorServiceSecGrp,
    });

    // ALB
    const fargateALB = new elbv2.ApplicationLoadBalancer(
      this,
      "fargateALB",
      {
        vpc: vpc,
        internetFacing: true,
      }
    );

    // ALB Listener
    const httpapiListener = fargateALB.addListener("httpapiListener", {
      port: 80,
      // Default Target Group
      defaultAction: elbv2.ListenerAction.fixedResponse(200),
    });

    // Target Groups
    const bookServiceTargetGroup = httpapiListener.addTargets(
      "bookServiceTargetGroup",
      {
        port: 80,
        priority: 1,
        healthCheck: {
          path: "/api/books/health",
          interval: cdk.Duration.seconds(30),
          timeout: cdk.Duration.seconds(3),
        },
        targets: [bookService],
        pathPattern: "/api/books*",
      }
    );

    const authorServiceTargetGroup = httpapiListener.addTargets(
      "authorServiceTargetGroup",
      {
        port: 80,
        priority: 2,
        healthCheck: {
          path: "/api/authors/health",
          interval: cdk.Duration.seconds(30),
          timeout: cdk.Duration.seconds(3),
        },
        targets: [authorService],
        pathPattern: "/api/authors*",
      }
    );

    new cdk.CfnOutput(this, 'LoadBalancerDNS', { value: fargateALB.loadBalancerDnsName });

  }
}
