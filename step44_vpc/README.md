We will follow this [workshop](https://intro-to-cdk.workshop.aws/the-workshop/3-create-lambda.html)


What is a VPC?

VPC stands for Virtual Cloud Private Cloud. The easiest way to describe a VPC is as your own private data center within the AWS infrastructure. You get to decide the network addresses that you will use throughout your infrastructure. Since this is your network, you can decide to slice it up any way you prefer.

npm install @aws-cdk/aws-ec2

npm install @aws-cdk/aws-lambda

npm install @aws-cdk/aws-apigateway

cdk synth

After running the Synth command you should see a long JSON output. Take a look at the different resources that you are about to deploy.

Notice how much was done just by 3 lines of VPC construct code! You will notice 2 Private Subnets that were created for you inside your VPC. 

What’s are Subnets? 

Subnets allow you to slice your VPC into small segments. Not all of your workloads belong together in a single network. There are components that are public facing, and there are those that you do not want to expose to the outside world (such as databases and secrets). Use Public Subnets to place your public-facing components and Private Subnets for your private ones.

Let’s talk about the code for the VPC we just created. Notice a property called ‘subnetConfiguration’. What is it and why is it needed? If we omit it CDK will create a few networking components inside our VPC that we don’t need. Stuff like Public Subnets, Nat Gateways, and Internet Gateway. Those components are only needed if our Lambda code is accessing an IP that is outside of our VPN. Since this is not our use-case (and in most cases, it won’t be your use-case), we rather keep things simple and more secure. Setting ‘subnetType: ec2.SubnetType.ISOLATED’, tells CDK to only create a Private Subnet without the other components. To learn more about the various options you have you can read the documentation for the VPC Construct.







# Welcome to your CDK TypeScript project!



The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
