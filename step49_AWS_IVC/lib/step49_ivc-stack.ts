import * as cdk from '@aws-cdk/core';
import * as ivs from '@aws-cdk/aws-ivs';
const cdk_spa_deploy_1 = require("cdk-spa-deploy");

const fs = require("fs");

export class Step49IvcStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const liveCh = new ivs.CfnChannel(this, 'Channel', {
      name: "liveChanel", 
      type: "BASIC",        //Avaialbe options are STANDARD & BASIC
      latencyMode: "LOW",    //Avaialbe options are    NORMAL | LOW
    //   authorized : true   *   Authorized playback requests with Tokens (JWTs) (https://docs.aws.amazon.com/ivs/latest/userguide/private-channels.html)
    
    });


// const keyPair = new ivs.PlaybackKeyPair(this, 'PlaybackKeyPair', {
//   publicKeyMaterial: "myPublicKeyPemString",
// });


    new cdk.CfnOutput(this, "playback URL", {
      value: liveCh.attrPlaybackUrl,
    });


  }
}
