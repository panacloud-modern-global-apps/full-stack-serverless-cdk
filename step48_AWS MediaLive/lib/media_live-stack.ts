import * as cdk from "@aws-cdk/core";
import * as medialive from "@aws-cdk/aws-medialive";
import * as mediapackage from "@aws-cdk/aws-mediapackage";
import * as iam from "@aws-cdk/aws-iam";
import { Effect } from "@aws-cdk/aws-iam";


export class MediaLiveStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // MediaLive Policy configuration..  * https://docs.aws.amazon.com/mediaconnect/latest/ug/security_iam_service-with-iam.html

    const policyInput = new iam.PolicyStatement ({
      effect : Effect.ALLOW,
      actions: [   "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents",
            "logs:DescribeLogStreams",
            "logs:DescribeLogGroups",         
            "mediaconnect:ManagedDescribeFlow",
            "mediaconnect:ManagedAddOutput",
            "mediaconnect:ManagedRemoveOutput",
            "ec2:describeSubnets",
            "ec2:describeNetworkInterfaces",
            "ec2:createNetworkInterface",
            "ec2:createNetworkInterfacePermission",
            "ec2:deleteNetworkInterface",
            "ec2:deleteNetworkInterfacePermission",
            "ec2:describeSecurityGroups",
            "mediapackage:DescribeChannel"],
            resources: ["*"]
    })

    
    // ** FIRST step: Create MediaPackage Channel

    const channel = new mediapackage.CfnChannel(this,"mediaPackage_MyLiveStream",
      {
        id: "MyLiveStream",
        description: "MyLiveStream Chanel",
      }
    );

    // ** SECOND step: Crate HSL Package and Add as endpoint to MediaPackage Channel
    const hlsPackage: mediapackage.CfnOriginEndpoint.HlsPackageProperty = {
      streamSelection: {
        minVideoBitsPerSecond: 0,
        maxVideoBitsPerSecond: 2147483647,
        streamOrder: "ORIGINAL",
      },
    };

    const hls_endpoint = new mediapackage.CfnOriginEndpoint( this, "endpoint_MyLiveStream",
      {
        channelId: "MyLiveStream",
        id: "endpoint_MyLiveStream",
        hlsPackage,
      }
    );
        // Output the endpoint URL for player

    new cdk.CfnOutput(this, "URL-For-Playback", {
      value: hls_endpoint.attrUrl,
    });


    // ** THIRD step:  MediaLive
    //(1)create MediaLive Security Group, (2)Create MediaLive Input, and (3) MediaLive Channel

    
    // (1) Create Security Group for MediaLive Input
    const security_groups_input = new medialive.CfnInputSecurityGroup(
      this,
      "mediaLive-SG-input",
      {
        whitelistRules: [{ cidr: "0.0.0.0/0" }], // Allow 0.0.0.0/0 - we can Modify as requirements
      }
    );

    // (2) Create Input with destinations output
    const medialive_input = new medialive.CfnInput(
      this,
      "mediaLive-input-channel",
      {
        name: "input-MyLiveStream",
        type: "RTMP_PUSH",
        inputSecurityGroups: [security_groups_input.ref],
        destinations: [{ streamName: "test/bootCamp123" }], //"bootCamp123" is a code for live streaming application (OBS ... )
      }
    );


    // (3) **  Media Live Channel Block

    // create IAM Role and attache Medialive Policy
    let iamRole = new iam.Role(this, "medialive_role", {
      roleName: "medialive_role",
      assumedBy: new iam.ServicePrincipal("medialive.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "AWSElementalMediaLiveFullAccess"
        ),
      ],
    });
    iamRole.addToPolicy(policyInput)

    // create MediaLive Channel

    var channelLive = new medialive.CfnChannel(
      this,
      "mediaLive-channel-live-stream",
      {
        channelClass: "SINGLE_PIPELINE", // SINGLE_PIPELINE creates a single and STANDARD will creates two encoder pipeline.
        name: "MyLiveStream",
        inputSpecification: {
          codec: "AVC",
          maximumBitrate: "MAX_10_MBPS",
          resolution: "SD", // *available options are SD/HD/UHD
        },
        inputAttachments: [
          {
            inputId: medialive_input.ref,
            inputAttachmentName: "attach-input",
          },
        ],
        destinations: [
          {
            id: "media-destination",
            mediaPackageSettings: [
              {
                channelId: "MyLiveStream",
              },
            ],
          },
        ],
        encoderSettings: {
          timecodeConfig: {
            source: "EMBEDDED",
          },

          // Audio descriptions
          audioDescriptions: [
            {
              audioSelectorName: "Default",
              audioTypeControl: "FOLLOW_INPUT",
              languageCodeControl: "FOLLOW_INPUT",
              name: "audio",
              //   codecSettings: {
                      // ... here we can add Audo codec settings 
              //   }
            },
          ],
          // Video descriptions
          videoDescriptions: [
            {
              codecSettings: {
                h264Settings: {
                  adaptiveQuantization: "HIGH",
                  framerateControl: "SPECIFIED",
                  framerateDenominator: 1,
                  framerateNumerator: 50,
                  parControl: "SPECIFIED",
                  profile: "HIGH",
                  rateControlMode: "CBR",
                },
              },
              height: 288,
              name: "video_720p30",
              respondToAfd: "NONE",
              scalingBehavior: "DEFAULT",
              sharpness: 100,
              width: 352,
            },
          ],

          // Output groups
          outputGroups: [
            {
              name: "SD",
              outputGroupSettings: {
                mediaPackageGroupSettings: {
                  destination: {
                    destinationRefId: "media-destination",
                  },
                },
              },
              outputs: [
                {
                  audioDescriptionNames: ["audio"],
                  outputName: "720p30",
                  videoDescriptionName: "video_720p30",
                  outputSettings: {
                    mediaPackageOutputSettings: {},
                  },
                },
              ],
            },
          ],
        },
        roleArn: iamRole.roleArn,
      }
    );

    // * we Used dependency to create HSL endpoint before chanel creation
    var mediadep = new cdk.ConcreteDependable();
    mediadep.add(channel);
    hls_endpoint.node.addDependency(mediadep);
    channelLive.node.addDependency(mediadep);

  }
}
