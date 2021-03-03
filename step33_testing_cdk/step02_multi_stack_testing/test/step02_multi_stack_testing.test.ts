import * as cdk from '@aws-cdk/core';
import * as Step02MultiStackTesting from '../lib/step02_multi_stack_testing-stack';
import '@aws-cdk/assert/jest';
import { SynthUtils } from '@aws-cdk/assert';
import * as lambda from '@aws-cdk/aws-lambda';
import * as my_construct from '../my_construct/my_construct';

test('TEST MAIN STACK', () => {

    const app = new cdk.App();
    const stack = new Step02MultiStackTesting.Step02MultiStackTestingStack(app, 'MyTestStack');


     expect(stack).toCountResources('AWS::Lambda::Function', 2)

    expect(stack).toHaveResource('AWS::Lambda::Function',{
      "Handler": "index.handler",
      "MemorySize": 1024,
    })
  
 expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();

});




test('MOCK A FUNCTION IN MAIN STACK', () => {
    const app = new cdk.App();

    const mockTagsAspect = jest.spyOn(cdk.Tags, "of");

    const stack = new Step02MultiStackTesting.Step02MultiStackTestingStack(app, 'MyTestStack');
    

    expect(mockTagsAspect).toBeCalledTimes(1)
});




test('TEST IF YOUR CUSTOM CONSTRUCT IS RUNNING IN THE MAIN STACK', () => {
      const app = new cdk.App();
      const stack = new Step02MultiStackTesting.Step02MultiStackTestingStack(app, 'MyTestStack');


      expect(stack).toCountResources('AWS::Lambda::Function', 2)

       expect(stack.node.tryFindChild('custom_construct')).not.toBeUndefined()
       expect(stack.node.tryFindChild('testLambda')).not.toBeUndefined()

      expect(stack.node.tryFindChild("testLambda1")).toBeUndefined()
  
  });




test('TESTING CHANGES THAT YOUR CUSTOM_STACK MAKES IN THE MAIN STACK', () => {
  
  const app = new cdk.App();
      
  const stack = new Step02MultiStackTesting.Step02MultiStackTestingStack(app, 'MyTestStack');
    
  expect(stack).toCountResources('AWS::DynamoDB::Table', 1)
 
  expect(stack.node.tryFindChild('table')).not.toBeUndefined();

});


