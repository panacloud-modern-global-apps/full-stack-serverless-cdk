
## AWS WAF( Web Application Firewall )

## Theory and Concept

[**AWS WAF ( Web Application Firewall )**](https://aws.amazon.com/waf/#:~:text=AWS%20WAF%20is%20a%20web,security%2C%20or%20consume%20excessive%20resources.&amp;text=The%20pricing%20is%20based%20on,web%20requests%20your%20application%20receives.) is a web application firewall that helps protect your web applications or APIs against common web exploits that may affect availability, compromise security, or consume excessive resources. AWS WAF gives you control over how traffic reaches your applications by enabling you to create security rules that block common attack patterns, such as SQL injection or cross-site scripting, and rules that filter out specific traffic patterns you define.

Three things make AWS WAF work

- [Access Control List](https://docs.aws.amazon.com/waf/latest/developerguide/web-acl.html)
- [Rules](https://docs.aws.amazon.com/waf/latest/developerguide/waf-rules.html)
- [Rule Group](https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-groups.html)


![AWS WAF Diagram](https://d1.awsstatic.com/products/WAF/product-page-diagram_AWS-WAF_How-it-Works@2x.452efa12b06cb5c87f07550286a771e20ca430b9.png)

[Using AWS WAF to protect your APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-aws-waf.html)


[Get Started with AWS WAF](https://aws.amazon.com/waf/#:~:text=AWS%20WAF%20is%20a%20web,security%2C%20or%20consume%20excessive%20resources.&text=The%20pricing%20is%20based%20on,web%20requests%20your%20application%20receives.)


# API:

[aws-wafv2 module](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-wafv2-readme.html)

[aws-wafregional module](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-wafregional-readme.html)

npm i @aws-cdk/aws-wafv2 @aws-cdk/aws-wafregional

### OR

yarn add @aws-cdk/aws-wafv2 @aws-cdk/aws-wafregional


[WAF ( Web Application Firewall ) WebACL](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-wafv2-webacl.html)

[WAF ( Web Application Firewall ) WebACL Rules](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-rule.html)

[AWS Managed Rules List for AWS WAF](https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-list.html)

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
