# FARGATE PIPELINE TO DEPLOY CONTAINER
  Pipelines enables seamless delivery of fargate container.
## Structure of Pipeline.
1. fetch repo from github
2. build container and save it in ECR
3. Deploy to ECS.  

NOTE: fargate container should already be running for the pipeline to work.



### Step 01
* clone the repo and push to github
* create OAUTH on github to use in pipeline

### Step 02
* cdk deploy

### Step 03

* change content in local-image/server.js from 'Hello World' to 'Hello World from Pipeline'.
* push to code to github

### Step 04

* cdk destroy