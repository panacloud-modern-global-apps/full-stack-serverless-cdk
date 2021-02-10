# Amazon GreenGrass v2

AWS IoT Greengrass brings local compute, messaging, data management, sync, and ML inference capabilities to edge devices. This enables devices to collect and analyze data closer to the source of information, react autonomously to local events, and communicate securely with each other on local networks.

## Steps to create and deploy component from AWS Greengrass v2

### Step 1 (Generate Key Value Pair)

- Navigate to ec2 dashboard. Under network and security click Key Pairs.
- Generate a key pair to connect to ec2 via ssh
- download the file with extension .pem. Let say the file name is my-ec2-key.pem
- After download go to the location where your key has been downloaded and run

```
chmod 400 my-ec2-key.pem
```

- If you do not set these permissions, then you cannot connect to your instance using this key pair.

### Step 2 (Deploy Code to AWS Using CDK)

- Now deploy you cdk code to AWS
- Navigate to ec2 and under instance you will find your instance.
- After the instance status turns to running click in the instance.
- A window will appear in the bottom which would have your public DNS name, public IPV4 adresses and other stuff
- After launching your instance go to the EC2 dashboard and click on the security groups.
  -Find security group for your stack and click on it. After that edit the inbound rules like shown in the image

![edit_rules](img/edit_rules.png)

![inbound_rules](img/inbound_rules.png)

### Step 3 (Download SSH Client)

- Download OpenSSH on your computer or SSH Client like PUTTY

### Step 4 (Connect To Instance)

- Click on the instance and choose connect
- Navigate to connect via ssh
- You will see a command like this

```
ssh -i my_ec2_private_key.pem ec2-user@ec2-1-1-1-1.compute-1.amazonaws.com
```

- Run the above command on your computer to connect to ec2 via ssh

- After you are connected to your Amazon EC2 instance, create the ggc_user and ggc_group accounts

```
sudo adduser --system ggc_user
sudo groupadd --system ggc_group
```

- Run the following command to check if hardlink and softlink protections are enabled

```
sudo sysctl -a | grep fs.protected
```

- If hardlinks and softlinks are set to 1, your protections are enabled correctly.

- Run the following script to mount Linux control groups

```
curl https://raw.githubusercontent.com/tianon/cgroupfs-mount/951c38ee8d802330454bdede20d85ec1c0f8d312/cgroupfs-mount > cgroupfs-mount.sh
chmod +x cgroupfs-mount.sh
sudo bash ./cgroupfs-mount.sh
```

### Step 5 (Create A Group in Greengrass)

- Navigate to greengrass from aws console
- Choose Classic(V1) > Groups > Create Group
- Use Default creation method and configure your group
- After creating group you should see a page where you will find option to download resources as .tar.gz
- Download it and keep it safe
  -Download the Greengrass core software from the [link](https://docs.aws.amazon.com/greengrass/v1/developerguide/what-is-gg.html#gg-core-download-tab)
- You have to download what best fits for your device. However in case of EC2 you should download x86_64 architecture and Linux distribution

### Step 6 (Install Dependencies for Greengrass v2)

- After connecting install Java, Python3, and nodeJS with the following commands.

Java

```
sudo apt install openjdk-8-jdk
```

Python3

```
sudo apt-get install python3.6
```

NodeJs

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash

nvm install 14.4.0

curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -

sudo apt-get install -y nodejs
```

If apt is not found try the same command with yum

### Step 7 (Install Iot Greengrassv2)

- To install greengrass v2
  Run

```
cd ~

curl -s https://d2s8p88vqu9w66.cloudfront.net/releases/greengrass-nucleus-latest.zip > greengrass-nucleus-latest.zip

unzip greengrass-nucleus-latest.zip -d GreengrassCore && rm greengrass-nucleus-latest.zip

```

### Step 8 (Configure AWS On EC2 Instance)

- It is ideal to use temporary credentials from an IAM Role.

- To Generate these credentials [visit](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html#using-temp-creds-sdk-cli)

- After retrieving credentials Run

```
export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
export AWS_SESSION_TOKEN=AQoDYXdzEJr1K...o5OytwEXAMPLE=`

```

### Step 9 (Launch Greengrass Software)

```java
sudo -E java -Droot="/greengrass/v2" -Dlog.store=FILE \
  -jar ./GreengrassCore/lib/Greengrass.jar \
  --aws-region region \
  --thing-name MyGreengrassCore \
  --thing-group-name MyGreengrassCoreGroup \
  --tes-role-name MyGreengrassV2TokenExchangeRole \
  --tes-role-alias-name MyGreengrassCoreTokenExchangeRoleAlias \
  --component-default-user ggc_user:ggc_group \
  --provision true \
  --setup-system-service true \
  --deploy-dev-tools true
```

- Change your aws region in the above command. You can leave other parameter as it is

- After that you should see a message like this

```
Successfully configured Nucleus with provisioned resource details!
Configured Nucleus to deploy aws.greengrass.Cli component
Successfully set up Nucleus as a system service

```

### Step 10 (Send Resources To EC2 Instance)

- From the earlier steps you should have downloaded two files on you computer. Move them to ec2 instance using

```
cd Path-to-downloaded-files

scp -i /path-to-your-my-ec2-key.pem/ -r greengrass-(id).tar.gz ec2-user@ec2-1-1-1-1.compute-1.amazonaws.com:~

scp -i /path-to-your-my-ec2-key.pem/ -r (id)-setup.tar.gz ec2-user@ec2-1-1-1-1.compute-1.amazonaws.com:~

```

- You can find (publid dns name e.gec2-user@ec2-1-1-1-1.compute-1.amazonaws.com) in your ec2 instance public dns name

- Extract these two files in ec2 instance using

```
sudo tar -xzvf greengrass-(id).tar.gz -C /
sudo tar -xzvf (id)-setup.tar.gz -C /greengrass
```

- Now on your ec2 instance cd /greengrass/certs/ and run following command to install certificate

```
sudo wget -O root.ca.pem https://www.amazontrust.com/repository/AmazonRootCA1.pem

cat root.ca.pem
```

### Step 11 (Start Your Greengrass Service)

- To start your service run

```
cd /greengrass/ggc/core/
sudo ./greengrassd start
```

- You should see a Greengrass successfully started message. Make a note of the PID and run

```
ps aux | grep PID-number
```

- Now Set up neclues service using

```java
aws greengrass create-deployment \
  --target-arn "arn:aws:iot:region:account-id:thing/MyGreengrassCore" \
  --components '{
    "aws.greengrass.Cli": {
      "componentVersion": "2.0.3"
    }
  }'
```

- For targetArn in above command navigate to greengrass on aws console and you will this ARN under Manage > Thing groups
- You should see a success message after that

- Run the following command to launce nucleus service

```
sudo /greengrass/v2/alts/current/distro/bin/loader
```

- let this terminal running and open a new terminal and connect to ec2 instance again via ssh commands

### Step 12 (Create Your First Compoent)

- On that instance run

```
cd ~/GreengrassCore

mkdir recipes

nano recipes/com.example.HelloWorld-1.0.0.json
```

and paste the following code there

```json
{
  "RecipeFormatVersion": "2020-01-25",
  "ComponentName": "com.example.HelloWorld",
  "ComponentVersion": "1.0.0",
  "ComponentDescription": "My first AWS IoT Greengrass component.",
  "ComponentPublisher": "Amazon",
  "ComponentConfiguration": {
    "DefaultConfiguration": {
      "Message": "world"
    }
  },
  "Manifests": [
    {
      "Platform": {
        "os": "linux"
      },
      "Lifecycle": {
        "Run": "python3 {artifacts:path}/hello_world.py '{configuration:/Message}'"
      }
    }
  ]
}
```

- Now run

```
mkdir -p artifacts/com.example.HelloWorld/1.0.0

nano artifacts/com.example.HelloWorld/1.0.0/hello_world.py
```

- Paste the following python code

```python
import sys
import datetime

message = f"Hello, {sys.argv[1]}! Current time: {str(datetime.datetime.now())}."

# Print the message to stdout.
print(message)

# Append the message to the log file.
with open('/tmp/Greengrass_HelloWorld.log', 'a') as f:
    print(message, file=f)

```

- Now deploy the component to greengrass core with the following command

```java
sudo /greengrass/v2/bin/greengrass-cli deployment create \
  --recipeDir ~/GreengrassCore/recipes \
  --artifactDir ~/GreengrassCore/artifacts \
  --merge "com.example.HelloWorld=1.0.0"
```

- Wait for the deployment to be completed for a couple of minutes and run this to verify the deployment

```
tail -f /tmp/Greengrass_HelloWorld.log
```

- Create a file called hello-world-config-update.json to contain the configuration update and run

```
nano hello-world-config-update-json
```

- Paste the following code into it

```json
{
  "com.example.HelloWorld": {
    "MERGE": {
      "Message": "friend"
    }
  }
}
```

- Run the following command to deploy the configuration

```java
sudo /greengrass/v2/bin/greengrass-cli deployment create \
  --merge "com.example.HelloWorld=1.0.0" \
  --update-config hello-world-config-update.json
```

- After doing the above remove it from your core device. This is required for you to deploy the component back to the core device after you upload it to AWS IoT Greengrass

```java
sudo /greengrass/v2/bin/greengrass-cli deployment create --remove="com.example.HelloWorld"
```

### Step 13 (Deploy your component)

- To deploy run

```
aws s3 mb s3://greengrass-component-artifacts-(aws-account-id)-region
```

- The command outputs the following information if the request succeeds.

```
make_bucket: greengrass-component-artifacts-(aws-account-id)-region
```

- To allow your greengrass device to access s3 create a file called component-artifact-policy.json and paste the following

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::DOC-EXAMPLE-BUCKET/*"
    }
  ]
}
```

- Now create policy using

```
aws iam create-policy \
  --policy-name MyGreengrassV2ComponentArtifactPolicy \
  --policy-document file://component-artifact-policy.json
```

- Copy the policy Amazon Resource Name (ARN) from the policy metadata in the output. You use this ARN to attach this policy to the core device role in the next step

- To attach policy run

```
aws iam attach-role-policy \
  --role-name MyGreengrassV2TokenExchangeRole \
  --policy-arn arn:aws:iam::123456789012:policy/MyGreengrassV2ComponentArtifactPolicy
```

- Upload the artifact to s3

```
aws s3 cp \
  artifacts/com.example.HelloWorld/1.0.0/hello_world.py \
  s3://DOC-EXAMPLE-BUCKET/artifacts/com.example.HelloWorld/1.0.0/hello_world.py
```

- Replace DOC-EXAMPLE-BUCKET with the name of the S3 bucket

- Now add artifact to recipe by running

```
nano recipes/com.example.HelloWorld-1.0.0.json
```

- paste the following line

```json
"Artifacts": [
  {
    "URI": "s3://DOC-EXAMPLE-BUCKET/artifacts/com.example.HelloWorld/1.0.0/hello_world.py"
  }
]
```

- Your recipe should look like this

```json
{
  "RecipeFormatVersion": "2020-01-25",
  "ComponentName": "com.example.HelloWorld",
  "ComponentVersion": "1.0.0",
  "ComponentDescription": "My first AWS IoT Greengrass component.",
  "ComponentPublisher": "Amazon",
  "ComponentConfiguration": {
    "DefaultConfiguration": {
      "Message": "world"
    }
  },
  "Manifests": [
    {
      "Platform": {
        "os": "linux"
      },
      "Lifecycle": {
        "Run": "python3 {artifacts:path}/hello_world.py '{configuration:/Message}'"
      },
      "Artifacts": [
        {
          "URI": "s3://DOC-EXAMPLE-BUCKET/artifacts/com.example.HelloWorld/1.0.0/hello_world.py"
        }
      ]
    }
  ]
}
```

- Next run

```
aws greengrassv2 create-component-version \
  --inline-recipe fileb://recipes/com.example.HelloWorld-1.0.0.json
```

- Your output should look like this

```json
{
  "arn": "arn:aws:greengrass:region:(aws-id):components:com.example.HelloWorld:versions:1.0.0",
  "componentName": "com.example.HelloWorld",
  "componentVersion": "1.0.0",
  "creationTimestamp": "Mon Nov 30 09:04:05 UTC 2020",
  "status": {
    "componentState": "REQUESTED",
    "message": "NONE",
    "errors": {}
  }
}
```

- Copy the ARN and run

```
aws greengrassv2 describe-component \
  --arn "arn:aws:greengrass:region:(aws-id):components:com.example.HelloWorld:versions:1.0.0"
```

- When the component state becomes DEPLOYABLE like

```json
{
  "arn": "arn:aws:greengrass:region:(aws-id):components:com.example.HelloWorld:versions:1.0.0",
  "componentName": "com.example.HelloWorld",
  "componentVersion": "1.0.0",
  "creationTimestamp": "2020-11-30T18:04:05.823Z",
  "publisher": "Amazon",
  "description": "My first AWS IoT Greengrass component.",
  "status": {
    "componentState": "DEPLOYABLE",
    "message": "NONE",
    "errors": {}
  },
  "platforms": [
    {
      "os": "linux",
      "architecture": "all"
    }
  ]
}
```

- Create a file called deployment.json and paste the following code using nano

```json
{
  "components": {
    "com.example.HelloWorld": {
      "componentVersion": "1.0.0",
      "configurationUpdate": {
        "merge": "{\"Message\":\"universe\"}"
      }
    }
  }
}
```

- Now run

```
aws greengrassv2 create-deployment \
  --target-arn "arn:aws:iot:region:account-id:thing/MyGreengrassCore" \
  --cli-input-json file://hello-world-deployment.json
```

- Your output should look like this

```json
{
  "deploymentId": "deb69c37-314a-4369-a6a1-3dff9fce73a9",
  "iotJobId": "b5d92151-6348-4941-8603-bdbfb3e02b75",
  "iotJobArn": "arn:aws:iot:region:account-id:job/b5d92151-6348-4941-8603-bdbfb3e02b75"
}
```

### Step 14 (Verification)

-Verify your installation succeed run

```
tail -f /tmp/Greengrass_HelloWorld.log
```

# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
