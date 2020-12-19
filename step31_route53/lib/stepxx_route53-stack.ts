import * as cdk from '@aws-cdk/core';
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as origins from "@aws-cdk/aws-cloudfront-origins";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import * as route53 from '@aws-cdk/aws-route53';
import * as targets from '@aws-cdk/aws-route53-targets';
import * as acm from "@aws-cdk/aws-certificatemanager"
import { IHostedZone } from '@aws-cdk/aws-route53';
import { ICertificate } from '@aws-cdk/aws-certificatemanager';


export class StepxxRoute53Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

// create a bucket to upload your app files
const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
  versioned: true,
});



//creating hosted zone for our domain
const myZone= new route53.PublicHostedZone(this, 'HostedZone', {
  zoneName: 'panacloud.tk',
}) as IHostedZone;

//ssl ceritificate
const certificate =new acm.DnsValidatedCertificate(this, 'CrossRegionCertificate', {
  domainName: 'panacloud.tk',
  hostedZone: myZone as any,
  region: 'us-east-1',
  
})as ICertificate;

// create a CDN to deploy your website
const distribution = new cloudfront.Distribution(this, "Distribution", {
  defaultBehavior: {
    origin: new origins.S3Origin(websiteBucket),

  },
  defaultRootObject: "index.html",
  enableIpv6:true,
  domainNames:["panacloud.tk"],
  certificate:certificate as any,
});

  // housekeeping for uploading the data in bucket 

  new s3deploy.BucketDeployment(this, "DeployWebsite", {
    sources: [s3deploy.Source.asset("./frontend")],
    destinationBucket: websiteBucket,
    distribution,
    distributionPaths: ["/*"],
  });

// Adding A(ipv4) record
new route53.ARecord(this, 'AliasA', {
  zone: myZone,
  target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),

});
//Adding ipv6 record
new route53.AaaaRecord(this, 'Alias', {
  zone: myZone,
  target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
});


  


  }
}
