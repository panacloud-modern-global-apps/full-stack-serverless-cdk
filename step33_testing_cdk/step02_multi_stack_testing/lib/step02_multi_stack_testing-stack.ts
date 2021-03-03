import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as my_construct from '../my_construct/my_construct'

export class Step02MultiStackTestingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    new lambda.Function(this, "testLambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: new lambda.InlineCode('exports.handler = async () => {\nconsole.log(\'hello world\');\n};'),
      handler: 'index.handler',
      memorySize: 1024,
    });

    cdk.Tags.of(this).add("hello", "world");


    new my_construct.my_construct(this, 'custom_construct', {
      functionName: "my_function"
    })
  }
}
