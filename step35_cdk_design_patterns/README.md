## CDK Design Patterns

CDK essentially follows Composite Design Pattern and applies it on AWS infrastructure resources by modelling them as hierarchical constructs.

[Composite Design Pattern](https://sourcemaking.com/design_patterns/composite)

[First learn about constructs](https://docs.aws.amazon.com/cdk/latest/guide/constructs.html)

[CDK Runtime Context](https://docs.aws.amazon.com/cdk/latest/guide/context.html)

[Tagging](https://docs.aws.amazon.com/cdk/latest/guide/tagging.html)

[Tagging Best Practices](https://d1.awsstatic.com/whitepapers/aws-tagging-best-practices.pdf)

[Understand construct Tree](https://docs.aws.amazon.com/cdk/latest/guide/constructs.html#constructs_tree)

[Construct Base Class](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_core.Construct.html)

[ConstructNode](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_core.ConstructNode.html)

[Aspect](https://docs.aws.amazon.com/cdk/latest/guide/aspects.html)

[Aspect implement the Visitor Pattern](https://en.wikipedia.org/wiki/Visitor_pattern)



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
