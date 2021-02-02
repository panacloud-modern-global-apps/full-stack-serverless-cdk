# Step Functions

## Introduction

Step Functions is a serverless orchestration service that lets you combine AWS Lambda functions and other AWS services to build business-critical applications. Through Step Functions' graphical console, you see your application’s workflow as a series of event-driven steps.

Step Functions is based on state machines and tasks. A state machine is a workflow. A task is a state in a workflow that represents a single unit of work that another AWS service performs. Each step in a workflow is a state.

With Step Functions' built-in controls, you examine the state of each step in your workflow to make sure that your application runs in order and as expected. Depending on your use case, you can have Step Functions call AWS services, such as Lambda, to perform tasks. 

The best thing about step functions is that they nicely integrate with the event-driven architectures as they innately generate events and can also be triggered by them.

[See more details here](https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html)

[Use step functions in cdk](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-stepfunctions-readme.html)

## Advantages of step functions with lambda functions

If you have a very complex back-end structure in which you have many lambda functions that communicate with eachother and get executed in a defined sequence. Moreover, you also want to implement
a reliable roll-back and error handling functionality then step functions are the way to go.

Step functions act as a state machine that allows you to pass information between lambdas and define their sequence. You can also run lambda functions based on some logical expressions like if-else.
Additionally, it also allows you to easily define roll-back paths and error handling.

[Step 20 Video in English on Facebook](https://www.facebook.com/zeeshanhanif/videos/10225683635182528)

[Step 20 Video in English on YouTube](https://www.youtube.com/watch?v=0gk3dYhwuJc)

[Step 20 Video in Urdu on Facebook](https://www.facebook.com/zeeshanhanif/videos/10225695152750460)

[Step 20 Video in Urdu on YouTube](https://www.youtube.com/watch?v=EQT1nJiSHNI)



