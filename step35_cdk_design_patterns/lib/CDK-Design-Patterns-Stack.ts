import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import console = require('console');
import { Construct, ConstructNode, IConstruct } from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';

//This Stack is created by API Developer
export class CDKDesignPatternsAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //Point 1: Every construct implements IConstruct and is part of the Composite Tree

    // Every Construct is a node is part of the Composite tree and implements IConstruct 
    const parent : IConstruct = this;

    //It also implements IConstruct
    const bucket: IConstruct = new s3.Bucket(this, 'MyFirstBucket', {
      versioned: true
    });

    //Point 2: All the parent reference and children are contained in the ConstructNode objects
    // The ConstructNode maintains all the relationships in the composite tree

    const stackNode: ConstructNode = this.node;

    //parent, which in this case is an App
    const app = stackNode.scope;

    //is this case the array will contain only one child i.e. the Bucket Construct
    const children: IConstruct[] = stackNode.children;


    const bucketNode: ConstructNode = bucket.node;

    //parent, which in this case is the stack
    const our_stack = bucketNode.scope;

    //bucket has no children
    const bucket_children: IConstruct[] = bucketNode.children;

    //You dont have to traverse the Construct tree manually you can use the visitor pattern
    
    //We want to traverse the Stack and all its children
    cdk.Aspects.of(scope).add(new TraverseResources(this));

    //https://docs.aws.amazon.com/cdk/latest/guide/tagging.html
    //Tags is the only built-in visitor in the CDK for now
    cdk.Tags.of(scope).add("Built By", "Panacloud");

    //https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_core.Annotations.html
    //You can also use Annotations on any Construct, it this case it will give an Error on the Stack Construct 
    //cdk.Annotations.of(this).addError("Stack Error: My Custom Error");

    //You can also get context in a number of different ways
    //https://docs.aws.amazon.com/cdk/latest/guide/context.html
      
  }
}

//https://docs.aws.amazon.com/cdk/latest/guide/aspects.html
//https://en.wikipedia.org/wiki/Visitor_pattern
class TraverseResources implements cdk.IAspect {
  
  constructor(stack: CDKDesignPatternsAppStack){
 
  }

  //this method will be called one time for each node and the node itself will be passed as a parameter
  public visit(node: IConstruct): void {
  
    if (node instanceof s3.CfnBucket) {
      //if you want to something specific to the CfnBucket
    }
  }
}




