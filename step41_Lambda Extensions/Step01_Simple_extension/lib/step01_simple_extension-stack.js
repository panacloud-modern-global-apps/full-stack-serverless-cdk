"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Step01SimpleExtensionStack = void 0;
const cdk = require("@aws-cdk/core");
const lambda = require("@aws-cdk/aws-lambda");
class Step01SimpleExtensionStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        //========================================
        // Lambda Layer that will be used as Extension
        //========================================
        const lambdaLayer = new lambda.LayerVersion(this, "ext-layer", {
            code: lambda.Code.fromAsset("lambda-layers"),
        });
        //========================================
        // Lambda Func
        //========================================
        const sendfunc = new lambda.Function(this, "sendlog", {
            code: lambda.Code.fromAsset("lambda"),
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: "hello.handler",
            memorySize: 1024,
            layers: [lambdaLayer],
        });
    }
}
exports.Step01SimpleExtensionStack = Step01SimpleExtensionStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlcDAxX3NpbXBsZV9leHRlbnNpb24tc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzdGVwMDFfc2ltcGxlX2V4dGVuc2lvbi1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxQ0FBcUM7QUFDckMsOENBQThDO0FBRTlDLE1BQWEsMEJBQTJCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDdkQsWUFBWSxLQUFvQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUNsRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QiwwQ0FBMEM7UUFDMUMsOENBQThDO1FBQzlDLDBDQUEwQztRQUMxQyxNQUFNLFdBQVcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRTtZQUM3RCxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDO1NBQzdDLENBQUMsQ0FBQztRQUVILDBDQUEwQztRQUMxQyxjQUFjO1FBQ2QsMENBQTBDO1FBRTFDLE1BQU0sUUFBUSxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQ3BELElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7WUFDckMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxPQUFPLEVBQUUsZUFBZTtZQUN4QixVQUFVLEVBQUUsSUFBSTtZQUNoQixNQUFNLEVBQUUsQ0FBQyxXQUFXLENBQUM7U0FDdEIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBdkJELGdFQXVCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gXCJAYXdzLWNkay9hd3MtbGFtYmRhXCI7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5leHBvcnQgY2xhc3MgU3RlcDAxU2ltcGxlRXh0ZW5zaW9uU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkNvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gTGFtYmRhIExheWVyIHRoYXQgd2lsbCBiZSB1c2VkIGFzIEV4dGVuc2lvblxuICAgIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIGNvbnN0IGxhbWJkYUxheWVyID0gbmV3IGxhbWJkYS5MYXllclZlcnNpb24odGhpcywgXCJleHQtbGF5ZXJcIiwge1xuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFwibGFtYmRhLWxheWVyc1wiKSxcbiAgICB9KTtcblxuICAgIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIExhbWJkYSBGdW5jXG4gICAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICBjb25zdCBzZW5kZnVuYyA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgXCJzZW5kbG9nXCIsIHtcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChcImxhbWJkYVwiKSxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xMl9YLFxuICAgICAgaGFuZGxlcjogXCJoZWxsby5oYW5kbGVyXCIsXG4gICAgICBtZW1vcnlTaXplOiAxMDI0LFxuICAgICAgbGF5ZXJzOiBbbGFtYmRhTGF5ZXJdLFxuICAgIH0pO1xuICB9XG59XG4iXX0=