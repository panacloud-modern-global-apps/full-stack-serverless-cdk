"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Step02NodejsLogsWithApiExtensionAndSaveInS3Stack = void 0;
const cdk = require("@aws-cdk/core");
const lambda = require("@aws-cdk/aws-lambda");
const s3 = require("@aws-cdk/aws-s3");
const iam = require("@aws-cdk/aws-iam");
class Step02NodejsLogsWithApiExtensionAndSaveInS3Stack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const bucket = new s3.Bucket(this, 'DemoBucket');
        const lambdaLayer = new lambda.LayerVersion(this, "lambdalayer", {
            code: lambda.Code.fromAsset("lambda-layers"),
        });
        const role = new iam.Role(this, 'Role', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        });
        const policy = new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["lambda:*", "s3:*"],
            resources: ["*"],
        });
        role.addToPolicy(policy);
        const sendfunc = new lambda.Function(this, "sendlog", {
            code: lambda.Code.fromAsset("lambda"),
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: "hello.handler",
            memorySize: 1024,
            layers: [lambdaLayer],
            role: role,
            environment: {
                S3_BUCKET_NAME: bucket.bucketName,
            },
        });
    }
}
exports.Step02NodejsLogsWithApiExtensionAndSaveInS3Stack = Step02NodejsLogsWithApiExtensionAndSaveInS3Stack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlcDAyX25vZGVqc19sb2dzX3dpdGhfYXBpX2V4dGVuc2lvbl9hbmRfc2F2ZV9pbl9zMy1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN0ZXAwMl9ub2RlanNfbG9nc193aXRoX2FwaV9leHRlbnNpb25fYW5kX3NhdmVfaW5fczMtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUNBQXFDO0FBQ3JDLDhDQUE4QztBQUM5QyxzQ0FBc0M7QUFDdEMsd0NBQXdDO0FBSXhDLE1BQWEsZ0RBQWlELFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDN0UsWUFBWSxLQUFvQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUNsRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLE1BQU0sR0FBRyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBRWpELE1BQU0sV0FBVyxHQUFHLElBQUksTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFO1lBQy9ELElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUM7U0FFN0MsQ0FBQyxDQUFDO1FBRUgsTUFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUU7WUFDdEMsU0FBUyxFQUFFLElBQUksR0FBRyxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDO1NBRTVELENBQUMsQ0FBQztRQUNILE1BQU0sTUFBTSxHQUFHLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQztZQUNyQyxNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLO1lBQ3hCLE9BQU8sRUFBRSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUM7WUFDN0IsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDO1NBQ2pCLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFHekIsTUFBTSxRQUFRLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDcEQsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztZQUNyQyxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLE9BQU8sRUFBRSxlQUFlO1lBQ3hCLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLE1BQU0sRUFBRSxDQUFDLFdBQVcsQ0FBQztZQUNyQixJQUFJLEVBQUMsSUFBSTtZQUNULFdBQVcsRUFBRTtnQkFDWCxjQUFjLEVBQUUsTUFBTSxDQUFDLFVBQVU7YUFDbEM7U0FFRixDQUFDLENBQUM7SUFLTCxDQUFDO0NBQ0Y7QUF4Q0QsNEdBd0NDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ0Bhd3MtY2RrL2NvcmUnO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gXCJAYXdzLWNkay9hd3MtbGFtYmRhXCI7XG5pbXBvcnQgKiBhcyBzMyBmcm9tIFwiQGF3cy1jZGsvYXdzLXMzXCI7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSBcIkBhd3MtY2RrL2F3cy1pYW1cIjtcblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuXG5leHBvcnQgY2xhc3MgU3RlcDAyTm9kZWpzTG9nc1dpdGhBcGlFeHRlbnNpb25BbmRTYXZlSW5TM1N0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IGNkay5Db25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIGNvbnN0IGJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgJ0RlbW9CdWNrZXQnKTtcblxuICAgIGNvbnN0IGxhbWJkYUxheWVyID0gbmV3IGxhbWJkYS5MYXllclZlcnNpb24odGhpcywgXCJsYW1iZGFsYXllclwiLCB7XG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoXCJsYW1iZGEtbGF5ZXJzXCIpLFxuXG4gICAgfSk7XG5cbiAgICBjb25zdCByb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsICdSb2xlJywge1xuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2xhbWJkYS5hbWF6b25hd3MuY29tJyksXG5cbiAgICB9KTtcbiAgICBjb25zdCBwb2xpY3kgPSBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICBhY3Rpb25zOiBbXCJsYW1iZGE6KlwiLCBcInMzOipcIl0sXG4gICAgICByZXNvdXJjZXM6IFtcIipcIl0sXG4gICAgfSk7XG4gICAgcm9sZS5hZGRUb1BvbGljeShwb2xpY3kpO1xuICAgIFxuXG4gICAgY29uc3Qgc2VuZGZ1bmMgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsIFwic2VuZGxvZ1wiLCB7XG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoXCJsYW1iZGFcIiksXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMTJfWCxcbiAgICAgIGhhbmRsZXI6IFwiaGVsbG8uaGFuZGxlclwiLFxuICAgICAgbWVtb3J5U2l6ZTogMTAyNCxcbiAgICAgIGxheWVyczogW2xhbWJkYUxheWVyXSxcbiAgICAgIHJvbGU6cm9sZSxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIFMzX0JVQ0tFVF9OQU1FOiBidWNrZXQuYnVja2V0TmFtZSxcbiAgICAgIH0sXG5cbiAgICB9KTtcblxuXG4gICAgXG5cbiAgfVxufVxuIl19