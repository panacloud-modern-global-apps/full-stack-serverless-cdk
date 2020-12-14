import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as ses from '@aws-cdk/aws-ses';
import * as actions from '@aws-cdk/aws-ses-actions';

export class SaveReceivedMailsInS3Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // creating a new bucket
    const bucket = new s3.Bucket(this, 'Bucket');

    // creating a new rule set
    const ruleSet = new ses.ReceiptRuleSet(this, 'RuleSet', {
      receiptRuleSetName: 'saving-email-rule-set',
    })

    // creating instance for taking email input while deployment
    // ref https://docs.aws.amazon.com/cdk/latest/guide/parameters.html
    const emailAddress = new cdk.CfnParameter(this, 'emailParam', {
      type: 'String', description: "Write your recipient email"
    });

    // Adding a rule inside a rule set
    ruleSet.addRule('INVOKE_LAMBDA_RULE', {
      recipients: [emailAddress.valueAsString], // if no recipients than the action will be called on any incoming mail addresses of verified domains
      actions: [
        new actions.S3({
          bucket,
          objectKeyPrefix: 'emails/', // will save all emails inside emails directory
        })
      ],
      scanEnabled: true, // Enable spam and virus scanning
    })


  }
}
