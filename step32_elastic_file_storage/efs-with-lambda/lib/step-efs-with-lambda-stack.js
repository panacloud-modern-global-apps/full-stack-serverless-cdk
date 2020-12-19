"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepEfsWithLambdaStack = void 0;
const cdk = require("@aws-cdk/core");
const efs = require("@aws-cdk/aws-efs");
const lambda = require("@aws-cdk/aws-lambda");
const ec2 = require("@aws-cdk/aws-ec2");
const apigw = require("@aws-cdk/aws-apigatewayv2");
const integrations = require("@aws-cdk/aws-apigatewayv2-integrations");
class StepEfsWithLambdaStack extends cdk.Stack {
    constructor(scope, id, props) {
        var _a;
        super(scope, id, props);
        const myVpc = new ec2.Vpc(this, "Vpc", {
            maxAzs: 2,
        });
        const fileSystem = new efs.FileSystem(this, "lambdaEfsFileSystem", {
            vpc: myVpc
        });
        const accessPoint = fileSystem.addAccessPoint("AccessPoint", {
            createAcl: {
                ownerGid: "1001",
                ownerUid: "1001",
                permissions: "750",
            },
            path: "/export/lambda",
            posixUser: {
                gid: "1001",
                uid: "1001",
            },
        });
        const efsLambda = new lambda.Function(this, "efsLambdaFunction", {
            runtime: lambda.Runtime.NODEJS_12_X,
            code: lambda.Code.fromAsset("lambda"),
            handler: "msg.handler",
            vpc: myVpc,
            filesystem: lambda.FileSystem.fromEfsAccessPoint(accessPoint, "/mnt/msg"),
        });
        const api = new apigw.HttpApi(this, "Endpoint", {
            defaultIntegration: new integrations.LambdaProxyIntegration({
                handler: efsLambda,
            }),
        });
        new cdk.CfnOutput(this, "HTTP API Url", {
            value: (_a = api.url) !== null && _a !== void 0 ? _a : "Something went wrong with the deploy",
        });
    }
}
exports.StepEfsWithLambdaStack = StepEfsWithLambdaStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlcC1lZnMtd2l0aC1sYW1iZGEtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzdGVwLWVmcy13aXRoLWxhbWJkYS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxQ0FBcUM7QUFDckMsd0NBQXdDO0FBQ3hDLDhDQUE4QztBQUM5Qyx3Q0FBd0M7QUFDeEMsbURBQW1EO0FBQ25ELHVFQUF1RTtBQUV2RSxNQUFhLHNCQUF1QixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQ25ELFlBQVksS0FBb0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7O1FBQ2xFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFO1lBQ3JDLE1BQU0sRUFBRSxDQUFDO1NBQ1YsQ0FBQyxDQUFDO1FBRUgsTUFBTSxVQUFVLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRTtZQUNqRSxHQUFHLEVBQUUsS0FBSztTQUNYLENBQUMsQ0FBQztRQUVILE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFO1lBQzNELFNBQVMsRUFBQztnQkFDUixRQUFRLEVBQUUsTUFBTTtnQkFDaEIsUUFBUSxFQUFFLE1BQU07Z0JBQ2hCLFdBQVcsRUFBRSxLQUFLO2FBQ25CO1lBQ0QsSUFBSSxFQUFDLGdCQUFnQjtZQUNyQixTQUFTLEVBQUM7Z0JBQ1IsR0FBRyxFQUFFLE1BQU07Z0JBQ1gsR0FBRyxFQUFFLE1BQU07YUFDWjtTQUNGLENBQUMsQ0FBQztRQUVILE1BQU0sU0FBUyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDL0QsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO1lBQ3JDLE9BQU8sRUFBRSxhQUFhO1lBQ3RCLEdBQUcsRUFBRSxLQUFLO1lBQ1YsVUFBVSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsV0FBVyxFQUFDLFVBQVUsQ0FBQztTQUN6RSxDQUFDLENBQUM7UUFFSCxNQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUM5QyxrQkFBa0IsRUFBRSxJQUFJLFlBQVksQ0FBQyxzQkFBc0IsQ0FBQztnQkFDMUQsT0FBTyxFQUFFLFNBQVM7YUFDbkIsQ0FBQztTQUNILENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO1lBQ3RDLEtBQUssUUFBRSxHQUFHLENBQUMsR0FBRyxtQ0FBSSxzQ0FBc0M7U0FDekQsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBM0NELHdEQTJDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xuaW1wb3J0ICogYXMgZWZzIGZyb20gXCJAYXdzLWNkay9hd3MtZWZzXCI7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSBcIkBhd3MtY2RrL2F3cy1sYW1iZGFcIjtcbmltcG9ydCAqIGFzIGVjMiBmcm9tIFwiQGF3cy1jZGsvYXdzLWVjMlwiO1xuaW1wb3J0ICogYXMgYXBpZ3cgZnJvbSBcIkBhd3MtY2RrL2F3cy1hcGlnYXRld2F5djJcIjtcbmltcG9ydCAqIGFzIGludGVncmF0aW9ucyBmcm9tIFwiQGF3cy1jZGsvYXdzLWFwaWdhdGV3YXl2Mi1pbnRlZ3JhdGlvbnNcIjtcblxuZXhwb3J0IGNsYXNzIFN0ZXBFZnNXaXRoTGFtYmRhU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkNvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgY29uc3QgbXlWcGMgPSBuZXcgZWMyLlZwYyh0aGlzLCBcIlZwY1wiLCB7XG4gICAgICBtYXhBenM6IDIsXG4gICAgfSk7XG5cbiAgICBjb25zdCBmaWxlU3lzdGVtID0gbmV3IGVmcy5GaWxlU3lzdGVtKHRoaXMsIFwibGFtYmRhRWZzRmlsZVN5c3RlbVwiLCB7XG4gICAgICB2cGM6IG15VnBjXG4gICAgfSk7XG5cbiAgICBjb25zdCBhY2Nlc3NQb2ludCA9IGZpbGVTeXN0ZW0uYWRkQWNjZXNzUG9pbnQoXCJBY2Nlc3NQb2ludFwiLCB7XG4gICAgICBjcmVhdGVBY2w6e1xuICAgICAgICBvd25lckdpZDogXCIxMDAxXCIsXG4gICAgICAgIG93bmVyVWlkOiBcIjEwMDFcIixcbiAgICAgICAgcGVybWlzc2lvbnM6IFwiNzUwXCIsXG4gICAgICB9LFxuICAgICAgcGF0aDpcIi9leHBvcnQvbGFtYmRhXCIsXG4gICAgICBwb3NpeFVzZXI6e1xuICAgICAgICBnaWQ6IFwiMTAwMVwiLFxuICAgICAgICB1aWQ6IFwiMTAwMVwiLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGVmc0xhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgXCJlZnNMYW1iZGFGdW5jdGlvblwiLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMTJfWCxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChcImxhbWJkYVwiKSxcbiAgICAgIGhhbmRsZXI6IFwibXNnLmhhbmRsZXJcIixcbiAgICAgIHZwYzogbXlWcGMsXG4gICAgICBmaWxlc3lzdGVtOiBsYW1iZGEuRmlsZVN5c3RlbS5mcm9tRWZzQWNjZXNzUG9pbnQoYWNjZXNzUG9pbnQsXCIvbW50L21zZ1wiKSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGFwaSA9IG5ldyBhcGlndy5IdHRwQXBpKHRoaXMsIFwiRW5kcG9pbnRcIiwge1xuICAgICAgZGVmYXVsdEludGVncmF0aW9uOiBuZXcgaW50ZWdyYXRpb25zLkxhbWJkYVByb3h5SW50ZWdyYXRpb24oe1xuICAgICAgICBoYW5kbGVyOiBlZnNMYW1iZGEsXG4gICAgICB9KSxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiSFRUUCBBUEkgVXJsXCIsIHtcbiAgICAgIHZhbHVlOiBhcGkudXJsID8/IFwiU29tZXRoaW5nIHdlbnQgd3Jvbmcgd2l0aCB0aGUgZGVwbG95XCIsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==