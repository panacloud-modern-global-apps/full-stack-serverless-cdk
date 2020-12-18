import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import { DockerImageAsset } from '@aws-cdk/aws-ecr-assets';

export class ContainerLambdasEcrStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //The directory ecr-lambda must include a Dockerfile
    const asset = new DockerImageAsset(this, 'EcrImage', {
      directory: ('ecr-lambda'),
    });
    
    const ecrLambda = new lambda.DockerImageFunction(this, 'LambdaFunctionECR', {
      code: lambda.DockerImageCode.fromEcr(asset.repository, {
        tag: '<Tag of the image>'
      })
    }) 
    
    asset.repository.grantPull(ecrLambda)
  }
}
