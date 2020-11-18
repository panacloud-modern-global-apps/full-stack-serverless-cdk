[aws-cloudfront module](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-cloudfront-readme.html)

[aws-s3 module](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-s3-readme.html)

[aws-s3-deployment module](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-s3-deployment-readme.html)

[Deploying Static Websites To AWS S3 + CloudFront + Route53 Using The TypeScript AWS CDK](https://blog.dennisokeeffe.com/blog/2020-11-04-deploying-websites-to-aws-s3-with-the-cdk/)

mkdir step02_hello_website

cd step02_hello_website

cdk init app --language typescript

npm install @aws-cdk/aws-s3 @aws-cdk/aws-s3-deployment @aws-cdk/aws-cloudfront @aws-cdk/aws-cloudfront-origins 

npm run build

cdk deploy

The deploy command will give the following output with a different subdomain after completion:

Outputs:

Step02HelloWebsiteStack.DistributionDomainName = d15yn76b7cv6tf.cloudfront.net





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
