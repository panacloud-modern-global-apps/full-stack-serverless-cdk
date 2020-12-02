import * as cdk from "@aws-cdk/core";
import * as stepFunctions from "@aws-cdk/aws-stepfunctions";


export class Step01PassWaitStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // creating steps for the step function

    // Pass does not do any processing. It only takes the input (or filters input) and can add some more data to the state
    // In this case it adds { ..., "subObject": { "triggerTime": 2 } } to the current JSON state
    
    const pass = new stepFunctions.Pass(this, "Pass", {
      result: stepFunctions.Result.fromObject({ triggerTime: 2 }),
      resultPath: "$.subObject",
    });

    // Wait does not do anything except for waiting for the defined time and then passing the input state to the output.
    // In this case we are waiting for 2 seconds. The value '2' is coming from the previous state {subObject:{"triggerTime": 2}}

    const wait = new stepFunctions.Wait(this, "Wait For Trigger Time", {
      time: stepFunctions.WaitTime.secondsPath("$.subObject.triggerTime"),
    });

    // creating chain to define the sequence of execution

    const chain = stepFunctions.Chain.start(pass).next(wait);

    // create a state machine

    new stepFunctions.StateMachine(this, "state_machine_pass_wait", {
      definition: chain,
    });
  }
}
