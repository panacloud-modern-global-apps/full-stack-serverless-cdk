![](typescript-python.png)

TypeScript was the first language supported for developing AWS CDK applications as CDK infrastructure is built in Typescript, and there is a substantial amount of example CDK code written in TypeScript. We have kept the main cdk stack code in Typescript and changed the rest into Python, mainly lambda function code.

Reference article:
[Which programming language is best for aws-cdk ](https://awsmaniac.com/which-programming-language-is-the-best-for-aws-cdk/)

# Type pitfalls

Python uses dynamic typing, where variables may refer to a value of any type. Parameters and return values may be annotated with types, but these are "hints" and are not enforced. This means that in Python, it is easy to pass the incorrect type of value to a AWS CDK construct. Instead of getting a type error during build, as you would from a statically-typed language, you may instead get a runtime error when the JSII layer (which translates between Python and the AWS CDK's TypeScript core) is unable to deal with the unexpected type.

# Using interfaces

Python doesn't have an interface feature as some other languages do, though it does have abstract base classes, which are similar. TypeScript, the language in which the AWS CDK is implemented, does provide interfaces, and constructs and other AWS CDK objects often require an object that adheres to a particular interface, rather than inheriting from a particular class. So the AWS CDK provides its own interface feature as part of the JSII layer.

# [Building Lambda functions with Python](https://docs.aws.amazon.com/lambda/latest/dg/lambda-python.html)

# [AWS Lambda function handler in Python](https://docs.aws.amazon.com/lambda/latest/dg/python-handler.html)

# AWS CDK in Python

If you wish to work with CDK in Python:
[Working with Python in CDK](https://docs.aws.amazon.com/cdk/latest/guide/work-with-cdk-python.html)
[AWS CDK idioms in Python](https://docs.aws.amazon.com/cdk/latest/guide/work-with-cdk-python.html)
