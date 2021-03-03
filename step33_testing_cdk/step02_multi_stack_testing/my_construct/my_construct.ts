import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';

interface props {
    functionName:string
}

export class my_construct extends cdk.Construct {

 handler: lambda.Function;

  constructor(scope: cdk.Construct, id: string, props?: props) {
    super(scope, id);


    this.handler = new lambda.Function(this, "testLambda1", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: new lambda.InlineCode('exports.handler = async () => {\nconsole.log(\'hello world\');\n};'),
      handler: 'index.handler',
      memorySize: 1024,
      functionName: props?.functionName
    });

     new dynamodb.Table(scope, 'table', {
        partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING }
    });


  }

}
