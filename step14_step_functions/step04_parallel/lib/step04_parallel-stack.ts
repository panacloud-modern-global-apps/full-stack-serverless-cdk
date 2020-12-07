import * as cdk from "@aws-cdk/core";
import * as stepFunctions from "@aws-cdk/aws-stepfunctions";


export class Step04ParallelStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const parallelBranch1 = new stepFunctions.Pass(this, "parallelBranch1", {
      result: stepFunctions.Result.fromObject({
        message: "hello parallel branch 1",
      }),
      resultPath: "$.parallel_branch_1",
    });

    const parallelBranch2 = new stepFunctions.Pass(this, "parallelBranch2", {
      result: stepFunctions.Result.fromObject({
        message: "hello parallel branch 2",
      }),
      resultPath: "$.parallel_branch_2",
    });

    const parallelBranch3 = new stepFunctions.Pass(this, "parallelBranch3", {
      result: stepFunctions.Result.fromObject({
        message: "hello parallel branch 3",
      }),
      resultPath: "$.parallel_branch_3",
    });

    const failureBranch = new stepFunctions.Pass(this, "failureBranch", {
      result: stepFunctions.Result.fromObject({
        message: "hello failure branch",
      }),
      resultPath: "$.failure_branch",
    });

    const success = new stepFunctions.Succeed(this, "successBranch");

    const parallel = new stepFunctions.Parallel(
      this,
      "Do the work in parallel"
    );

    // Add branches to be executed in parallel
    parallel.branch(parallelBranch1);
    parallel.branch(parallelBranch2);
    parallel.branch(parallelBranch3);

    // Retry the whole workflow if something goes wrong
    parallel.addRetry({ maxAttempts: 1 });

    // How to recover from errors
    parallel.addCatch(failureBranch);

    // What to do in case everything succeeded
    parallel.next(success);

    // create a chain

    const chain = stepFunctions.Chain.start(parallel);

    // create a state machine

    new stepFunctions.StateMachine(this, "parallelStateMachine", {
      definition: chain,
    });
  }
}
