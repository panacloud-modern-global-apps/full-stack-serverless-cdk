# Path based routing using Application Load Balancer
This example aims to build two microservices which are connected to ALB. ALB exposes a DNS for a user to reach both containers based on different paths.The books microservice listens to /api/books while the other listens at the /api/authors path.

### Step 01: Build and test the services Locally
#### Book Service
* cd /src/book-service
* docker build -t book-service .
* docker tag book-service:latest XXXXXXXXXXX.dkr.ecr.us-east-1.amazonaws.com/book-service:latest // replace XXXXXXXXXXX with aws account id
* docker run -p8080:80 book-service
* docker ps
* docker kill <CONTAINER-ID> // kill the container to avoid port conflict
* curl -s http://localhost:8080/api/books // this should return an array of books

#### Author Service
* cd /src/author-service
* docker build -t author-service .
* docker tag author-service:latest XXXXXXXXXXX.dkr.ecr.us-east-1.amazonaws.com/author-service:latest // replace XXXXXXXXXXX with aws account id
* docker run -p8080:80 book-service
* curl -s http://localhost:8080/api/books //this should return an array of authors.

### Step 02: Create ECR repo and push Images
* aws ecr get-login-password --region us-east-1 | docker login  --username AWS   --password-stdin XXXXXXXXXXX.dkr.ecr.us-east-1.amazonaws.com // login to ECR
* aws ecr create-repository --repository-name book-service --image-scanning-configuration scanOnPush=false // create book-service repo in ECR
* aws ecr create-repository --repository-name author-service --image-scanning-configuration scanOnPush=false
* docker push XXXXXXXXXXX.dkr.ecr.us-east-1.amazonaws.com/book-service:latest // replace XXXXXXXXXXX with aws account id.
* docker push XXXXXXXXXXX.dkr.ecr.us-east-1.amazonaws.com/author-service:latest


### Step 03: Create VPC and Cluster
``` javascript 
    const vpc = new ec2.Vpc(this, "ProducerVPC");

    const cluster = new ecs.Cluster(this, "Fargate Cluster", {
      vpc: vpc,
    });
```
### Step 04: Create task definitions and assign IAM role.
We need to define task for our container a task definition require the memory,cpu and execution role to work,different configuration for cpu and memory can be found [here](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html).
``` javascript
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
        memoryLimitMiB: 512, // memory for container 
        cpu: 256,   // cpu for container 
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
 ```
 ### Step 05: Add container to task definitons created in the previous step.
 Since images are already uploaded in the ECR we just need to specify them when adding container to our task definition.
``` javascript
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
        logging: bookServiceLogDriver, // logs for this container 
      }
    );

    const authorServiceContainer = authorServiceTaskDefinition.addContainer(
      "authorServiceContainer",
      {
        image: ecs.ContainerImage.fromEcrRepository(authorservicerepo),
        logging: authorServiceLogDriver,
      }
    );
 ```

 ### Step 06: Add port mappings to containers.
 Since we need our container to be accessible to everyone we will expose port 80.
``` javascript
    bookServiceContainer.addPortMappings({
      containerPort: 80,
    });

    authorServiceContainer.addPortMappings({
      containerPort: 80,
    });
 ```

### Step 07: Create Security Groups for both task.
Fargate containers run on EC2, so we need to configure our inbound and outbound rules to allow public access.
``` javascript
 const bookServiceSecGrp = new ec2.SecurityGroup(
      this,
      "bookServiceSecurityGroup",
      {
        allowAllOutbound: true, 
        securityGroupName: "bookServiceSecurityGroup",
        vpc: vpc,
      }
    );

    bookServiceSecGrp.connections.allowFromAnyIpv4(ec2.Port.tcp(80)); // opens port 80 for our container

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

 ```

### Step 08: Create Servies for task definitions.
Create services for our task definition, here assignPublicIp = false because we only want our container to be accessble through our ALB.
``` javascript
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
 ```

### Step 09: Create Application load Balancer and Listner.
Create an ALB with internet facing enabled allowing public access.
``` javascript 
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
      port: 80, // The port on which the listener listens for requests.
      // Default Target Group
      defaultAction: elbv2.ListenerAction.fixedResponse(200), // Default action to take for requests to this listener.
    });
```
### Step 10: Define ALB rules for both services.
We want alb to listen to port 80 for both container at different paths.
``` javascript 
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
        pathPattern: "/api/books*", // path for our books service
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
        pathPattern: "/api/authors*", // path for our authors service
      }
    );
```
### Step 11: Testing
After deploying ALB-DNS will be output in console.
``` javascript 
    curl http://<ALB-DNS>/api/books // return an array of books
    curl http://<ALB-DNS>/api/authors 
```

### Step 08: Clean Up!
* cdk destroy

## Reference
The complete example can be found [here](https://aws.amazon.com/blogs/containers/building-http-api-based-services-using-aws-fargate/)

# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
