
TypeScript was the first language supported for developing AWS CDK applications as CDK infrastructure is built in Typescript, and there is a substantial amount of example CDK code written in TypeScript. We have kept  CDK code in Typescript and changed the rest into Python, mainly lambda functions.

Reference article:
[Which programming language is best for CDK ](https://awsmaniac.com/which-programming-language-is-the-best-for-aws-cdk/)

# Type pitfalls

Python uses dynamic typing, where variables may refer to a value of any type. Parameters and return values may be annotated with types, but these are "hints" and are not enforced. This means that in Python, it is easy to pass the incorrect type of value to a AWS CDK construct. Instead of getting a type error during build, as you would from a statically-typed language, you may instead get a runtime error when the JSII layer (which translates between Python and the AWS CDK's TypeScript core) is unable to deal with the unexpected type.

# Using interfaces

Python doesn't have an interface feature as some other languages do, though it does have abstract base classes, which are similar. TypeScript, the language in which the AWS CDK is implemented, does provide interfaces, and constructs and other AWS CDK objects often require an object that adheres to a particular interface, rather than inheriting from a particular class. So the AWS CDK provides its own interface feature as part of the JSII layer.

# [Building Lambda functions with Python](https://docs.aws.amazon.com/lambda/latest/dg/lambda-python.html)

# [AWS Lambda function handler in Python](https://docs.aws.amazon.com/lambda/latest/dg/python-handler.html)

# Boto3

## We will also use boto3 in some of our lambda functions

Boto is the Amazon Web Services (AWS) SDK for Python. It enables Python developers to create, configure, and manage AWS services, such as EC2 and S3. Boto provides an easy to use, object-oriented API, as well as low-level access to AWS services.

## For more information about boto3 check out this [documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)

[Boto3 Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)

# AWS CDK in Python

If you wish to work with CDK in Python:

[Working with Python in CDK](https://docs.aws.amazon.com/cdk/latest/guide/work-with-cdk-python.html)
[AWS CDK idioms in Python](https://docs.aws.amazon.com/cdk/latest/guide/work-with-cdk-python.html)


