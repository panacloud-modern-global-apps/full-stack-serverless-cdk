# Lambda container image

## Introduction

You can package your Lambda function code and dependencies as a container image and you can then upload the image to your container registry hosted on Amazon Elastic Container Registry (Amazon ECR).

AWS provides a set of open-source base images that you can use to create your container image. These base images include a runtime interface client to manage the interaction between Lambda and your function code.
You can also use an alternative base image from another container registry. Lambda provides open-source runtime interface clients that you add to an alternative base image to make it compatible with Lambda.

## Note
- Lambda supports only Linux-based container images
- The container image must implement the Lambda [Runtime API](https://docs.aws.amazon.com/lambda/latest/dg/runtimes-api.html). The AWS open-source [runtime interface clients](https://docs.aws.amazon.com/lambda/latest/dg/runtimes-images.html#runtimes-api-client) implement the API. You can add a runtime interface client to your preferred base image to make it compatible with Lambda.

## To create an image from an [AWS base image](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-image.html) for Lambda

To create an image from an AWS base image for Lambda

1. On your local machine, create a project directory for your new function.
2. Create an app directory in the project directory, and then add your function handler code to the app directory.

3. Use a text editor to create a new Dockerfile. 


```Dockerfile
#Dockerfile

FROM public.ecr.aws/lambda/nodejs:12
# Alternatively, you can pull the base image from Docker Hub: amazon/aws-lambda-nodejs:12

COPY app.js package.json /var/task/

# Install NPM dependencies for function
RUN npm install

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "app.handler" ]  
```

4. Build your Docker image with the docker build command. Enter a name for the image. The following example names the image hello-world. 
```
docker build -t hello-world . 
```
5. Authenticate the Docker CLI to your Amazon ECR registry.
```
aws ecr get-login-password --region "us-east-1" | docker login --username AWS --password-stdin "123456789012".dkr.ecr."us-east-1".amazonaws.com    
```
Change only highlighted fields i.e `region` and `account number` also *remove the double quotes* from the command

6. Tag your image to match your repository name, and deploy the image to Amazon ECR using the docker push command. 
```
docker tag  hello-world:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/hello-world:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/hello-world:latest   
```

## Article link
[Creating Lambda container images](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html)
