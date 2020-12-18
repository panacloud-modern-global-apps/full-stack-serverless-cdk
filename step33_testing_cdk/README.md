# Testing AWS CDK 
With the AWS CDK, your infrastructure can be as testable as any other code you write. This article illustrates one approach to testing AWS CDK apps written in TypeScript using the Jest test framework. Currently, TypeScript is the only supported language for testing AWS CDK infrastructure, though we intend to eventually make this capability available in all languages supported by the AWS CDK.


There are three categories of tests you can write for AWS CDK apps.

* **Snapshot tests** test the synthesized AWS CloudFormation template against a previously-stored baseline template. This way, when you're refactoring your app, you can be sure that the refactored code works exactly the same way as the original. If the changes were intentional, you can accept a new baseline for future tests.

* **Fine-grained assertions** test specific aspects of the generated AWS CloudFormation template, such as "this resource has this property with this value." These tests help when you're developing new features, since any code you add will cause your snapshot test to fail even if existing features still work. When this happens, your fine-grained tests will reassure you that the existing functionality is unaffected.

* **Validation tests** help you "fail fast" by making sure your AWS CDK constructs raise errors when you pass them invalid data. The ability to do this type of testing is a big advantage of developing your infrastructure in a general-purpose programming language.

[Testing infrastructure with the AWS Cloud Development Kit (CDK)
](https://aws.amazon.com/blogs/developer/testing-infrastructure-with-the-aws-cloud-development-kit-cdk/)

[Testing constructs
](https://docs.aws.amazon.com/cdk/latest/guide/testing.html)

[Testing constructs workshop](https://cdkworkshop.com/20-typescript/70-advanced-topics/100-construct-testing.html)

[Jest docs](https://jestjs.io/docs/en/getting-started.html)

[AWS CDK Assert](https://github.com/aws/aws-cdk/tree/master/packages/%40aws-cdk/assert)


[TESTING YOUR INFRASTRUCTURE AS CODE WITH AWS CDK (Typescript + Jest)
](https://www.youtube.com/watch?v=fWtuwGSoSOU)



