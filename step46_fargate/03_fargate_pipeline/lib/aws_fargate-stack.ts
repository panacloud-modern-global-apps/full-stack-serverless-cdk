import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from "@aws-cdk/aws-iam";
import * as CodePipeline from "@aws-cdk/aws-codepipeline"
import * as CodePipelineAction from "@aws-cdk/aws-codepipeline-actions"
import * as codebuild from "@aws-cdk/aws-codebuild"


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
      taskRole: taskrole,
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


    //////////////////////////////////PIPELINE//////////////////////////////////////////////////////////////////////////////////////////

    const sourceOutput = new CodePipeline.Artifact() // saves output of source i.e github repo

    const buildOutput = new CodePipeline.Artifact() // saves imagedefinitions.json to run the container 


    const buildProject = new codebuild.PipelineProject(this, "BuildNodejsApp", {
      description: "Build project for the Fargate pipeline",
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_3_0,
        privileged: true // true enables us to build docker images.
      },

      // buildSpec: codebuild.BuildSpec.fromSourceFilename("./buildspec.yml")
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          pre_build: {
            commands: [
              "$(aws ecr get-login --no-include-email --region us-east-1)"
            ]
          },
          build: {
            commands: [
              "cd local-image",
              "docker build -t <IMAGE_NAME> .", // get your image name from ECR in aws console aws-cdk/assets:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
              "docker tag <IMAGE_NAME> <ECR_URL>", // get yur image url from ECR in aws console 
              "cd .."
            ]
          },
          post_build: {
            commands: [
              "docker push <ECR_URL>", 
              "printf '[{\"name\":\"WebContainer\",\"imageUri\":\"%s\"}]' <ECR_URL> > imagedefinitions.json" // this command generates a json file for the name of container and image url which is used to start is from pipeline
            ]
          }
        },
        artifacts: {
          files: ["imagedefinitions.json"] 
        }
      })
    });



     ///Define a pipeline
     const pipeline = new CodePipeline.Pipeline(this, 'ecsPipeline', {
      crossAccountKeys: false,  //Pipeline construct creates an AWS Key Management Service (AWS KMS) which cost $1/month. this will save your $1.
      restartExecutionOnUpdate: true,  //Indicates whether to rerun the AWS CodePipeline pipeline after you update it.
    });


    // allow buildproject to access ecr.
    const policy = new iam.PolicyStatement()
    policy.addActions("ecr:*")
    policy.addResources("*")
    buildProject.addToRolePolicy(policy);

    //First Stage Source
    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new CodePipelineAction.GitHubSourceAction({
          actionName: 'Checkout',
          owner: 'github-user-name',
          repo: "repo-name",
          oauthToken: cdk.SecretValue.secretsManager('GITHUB_TOKEN'), ///create token on github and save it on aws secret manager or cdk.SecretValue.plainText("")
          output: sourceOutput,   ///Output will save in the sourceOutput Artifact
          branch: "master",       ///Branch of your repo
        }),
      ],
    })
  // build stage
    pipeline.addStage({
      stageName: "Build",
      actions: [
        new CodePipelineAction.CodeBuildAction({
          actionName: "fargateBuild",
          project: buildProject,
          input: sourceOutput,
          outputs: [buildOutput],
        }),
      ],
    })

    // deploy stage
    pipeline.addStage({
      stageName: "Deploy",
      actions: [
        new CodePipelineAction.EcsDeployAction({
          actionName: "ECSAction",
          service: fargateService,
          input: buildOutput
        }),
    
      ],
    })

   
    
  
  
  }
}
