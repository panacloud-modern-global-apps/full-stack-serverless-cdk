import * as cdk from '@aws-cdk/core';
import * as CodePipeline from '@aws-cdk/aws-codepipeline'
import * as CodePipelineAction from '@aws-cdk/aws-codepipeline-actions'

export class Step01SetupBasicPipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // Artifact from source stage
    const sourceOutput = new CodePipeline.Artifact();

    const pipline = new CodePipeline.Pipeline(this, 'CDKPipeline', {
     crossAccountKeys: false,  //Pipeline construct creates an AWS Key Management Service (AWS KMS) which cost $1/month. this will save your $1.
     restartExecutionOnUpdate: true,  //Indicates whether to rerun the AWS CodePipeline pipeline after you update it.
   });
   ///Adding stages to pipeline

   //First Stage Source
   pipline.addStage({
     stageName: 'Source',
     actions: [
       new CodePipelineAction.GitHubSourceAction({
         actionName: 'Checkout',
         owner: 'github-username',
         repo: "github-repo-name",
         oauthToken: cdk.SecretValue.secretsManager('GITHUB_TOKEN'), ///create token on github and save it on aws secret manager
         output: sourceOutput,                                       ///Output will save in the sourceOutput Artifact
         branch: "master",                                           ///Branch of your repo
       }),
     ],
   })

  }
}
