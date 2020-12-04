import * as cdk from "@aws-cdk/core";
import * as stepFunctions from "@aws-cdk/aws-stepfunctions";


export class Step05MapStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // this initial "pass" function inserts an array in the output {}
    const initialState = new stepFunctions.Pass(this, "initialState", {
      result: stepFunctions.Result.fromArray(["entry1", "entry2", "entry3"]),
      resultPath: "$.arrayOutput",
    });

    // this pass function doesnt change anything. We just made this to explain the mapping process

    const mapPass = new stepFunctions.Pass(this, "mapping");

    // this is a mapping function that runs 'mapPass' for each element in the state path {arrayOutput:[....]} coming
    // from the previous step. In this case we have 3 elements in the array therefore the "mapPass" would run 3 times.

    const map = new stepFunctions.Map(this, "MapState", {
      maxConcurrency: 1,
      itemsPath: stepFunctions.JsonPath.stringAt("$.arrayOutput"),
    });
    map.iterator(mapPass);

    // created a chain

    const chain = stepFunctions.Chain.start(initialState).next(map);

    // create a state machine

    new stepFunctions.StateMachine(this, "mapStateMachine", {
      definition: chain,
    });
  }
}
