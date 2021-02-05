"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackStack = void 0;
const cdk = require("@aws-cdk/core");
const rds = require("@aws-cdk/aws-rds");
const ec2 = require("@aws-cdk/aws-ec2");
const lambda = require("@aws-cdk/aws-lambda");
const SM = require("@aws-cdk/aws-secretsmanager");
const iam = require("@aws-cdk/aws-iam");
class BackStack extends cdk.Stack {
    constructor(scope, id, props) {
        var _a, _b;
        super(scope, id, props);
        // The code that defines your stack goes here
        //  create vpc for the databace instance
        const vpc = new ec2.Vpc(this, "myrdsvpc");
        //  create database instance
        const myDBInstance = new rds.DatabaseInstance(this, "MySQL", {
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.SMALL),
            vpc,
            engine: rds.DatabaseInstanceEngine.mysql({
                version: rds.MysqlEngineVersion.VER_5_6_39,
            }),
            publiclyAccessible: true,
            multiAz: false,
            allocatedStorage: 100,
            storageType: rds.StorageType.STANDARD,
            cloudwatchLogsExports: ["audit", "error", "general"],
            databaseName: "mySqlDataBase",
            deletionProtection: false,
            vpcPlacement: { subnetType: ec2.SubnetType.PUBLIC },
        });
        //  for lambda RDS and VPC access
        const role = new iam.Role(this, "LambdaRole", {
            assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonRDSDataFullAccess"),
                iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaVPCAccessExecutionRole"),
            ],
        });
        const fo = ((_a = myDBInstance.secret) === null || _a === void 0 ? void 0 : _a.secretName.toString()) || "kk";
        const foo = ((_b = myDBInstance.secret) === null || _b === void 0 ? void 0 : _b.secretArn) || "foooo";
        //  create a function to access database 
        const hello = new lambda.Function(this, "HelloHandler", {
            runtime: lambda.Runtime.NODEJS_10_X,
            code: lambda.Code.fromAsset("lambda/lambda-p.zip"),
            handler: "index.handler",
            timeout: cdk.Duration.minutes(1),
            vpc,
            role,
            environment: {
                vala: `${SM.Secret.fromSecretAttributes(this, "sna", { secretArn: foo })
                    .secretValue}`,
                HOST: myDBInstance.dbInstanceEndpointAddress,
            },
        });
        //  create lambda once dbinstance is created 
        hello.node.addDependency(myDBInstance);
        //  allow lambda to connect to the database instance
        myDBInstance.grantConnect(role);
    }
}
exports.BackStack = BackStack;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFjay1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhY2stc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUNBQXFDO0FBQ3JDLHdDQUF3QztBQUN4Qyx3Q0FBd0M7QUFDeEMsOENBQThDO0FBQzlDLGtEQUFrRDtBQUNsRCx3Q0FBd0M7QUFFeEMsTUFBYSxTQUFVLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDdEMsWUFBWSxLQUFvQixFQUFFLEVBQVUsRUFBRSxLQUFzQjs7UUFDbEUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsNkNBQTZDO1FBRTdDLHdDQUF3QztRQUV4QyxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRTFDLDRCQUE0QjtRQUU1QixNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO1lBQzNELFlBQVksRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FDL0IsR0FBRyxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQzVCLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUN2QjtZQUNELEdBQUc7WUFDSCxNQUFNLEVBQUUsR0FBRyxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQztnQkFDdkMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVO2FBQzNDLENBQUM7WUFDRixrQkFBa0IsRUFBRSxJQUFJO1lBQ3hCLE9BQU8sRUFBRSxLQUFLO1lBQ2QsZ0JBQWdCLEVBQUUsR0FBRztZQUNyQixXQUFXLEVBQUUsR0FBRyxDQUFDLFdBQVcsQ0FBQyxRQUFRO1lBQ3JDLHFCQUFxQixFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUM7WUFDcEQsWUFBWSxFQUFFLGVBQWU7WUFDN0Isa0JBQWtCLEVBQUUsS0FBSztZQUN6QixZQUFZLEVBQUUsRUFBRSxVQUFVLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUU7U0FRcEQsQ0FBQyxDQUFDO1FBRUgsaUNBQWlDO1FBQ2pDLE1BQU0sSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQzVDLFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQztZQUMzRCxlQUFlLEVBQUU7Z0JBQ2YsR0FBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyx5QkFBeUIsQ0FBQztnQkFDckUsR0FBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FDeEMsOENBQThDLENBQy9DO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFFSCxNQUFNLEVBQUUsR0FBRyxPQUFBLFlBQVksQ0FBQyxNQUFNLDBDQUFFLFVBQVUsQ0FBQyxRQUFRLE9BQU0sSUFBSSxDQUFDO1FBQzlELE1BQU0sR0FBRyxHQUFHLE9BQUEsWUFBWSxDQUFDLE1BQU0sMENBQUUsU0FBUyxLQUFJLE9BQU8sQ0FBQztRQUV0RCx5Q0FBeUM7UUFDekMsTUFBTSxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDdEQsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUM7WUFDbEQsT0FBTyxFQUFFLGVBQWU7WUFDeEIsT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNoQyxHQUFHO1lBQ0gsSUFBSTtZQUNKLFdBQVcsRUFBRTtnQkFDWCxJQUFJLEVBQUUsR0FDSixFQUFFLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLENBQUM7cUJBQzVELFdBQ0wsRUFBRTtnQkFDRixJQUFJLEVBQUUsWUFBWSxDQUFDLHlCQUF5QjthQUM3QztTQUNGLENBQUMsQ0FBQztRQUVILDZDQUE2QztRQUM3QyxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUV2QyxvREFBb0Q7UUFFcEQsWUFBWSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVwQyxDQUFDO0NBQUM7QUE1RUYsOEJBNEVFO0FBQUEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xuaW1wb3J0ICogYXMgcmRzIGZyb20gXCJAYXdzLWNkay9hd3MtcmRzXCI7XG5pbXBvcnQgKiBhcyBlYzIgZnJvbSBcIkBhd3MtY2RrL2F3cy1lYzJcIjtcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tIFwiQGF3cy1jZGsvYXdzLWxhbWJkYVwiO1xuaW1wb3J0ICogYXMgU00gZnJvbSBcIkBhd3MtY2RrL2F3cy1zZWNyZXRzbWFuYWdlclwiO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gXCJAYXdzLWNkay9hd3MtaWFtXCI7XG5cbmV4cG9ydCBjbGFzcyBCYWNrU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkNvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gVGhlIGNvZGUgdGhhdCBkZWZpbmVzIHlvdXIgc3RhY2sgZ29lcyBoZXJlXG5cbiAgICAvLyAgY3JlYXRlIHZwYyBmb3IgdGhlIGRhdGFiYWNlIGluc3RhbmNlXG5cbiAgICBjb25zdCB2cGMgPSBuZXcgZWMyLlZwYyh0aGlzLCBcIm15cmRzdnBjXCIpO1xuXG4gICAgLy8gIGNyZWF0ZSBkYXRhYmFzZSBpbnN0YW5jZVxuXG4gICAgY29uc3QgbXlEQkluc3RhbmNlID0gbmV3IHJkcy5EYXRhYmFzZUluc3RhbmNlKHRoaXMsIFwiTXlTUUxcIiwge1xuICAgICAgaW5zdGFuY2VUeXBlOiBlYzIuSW5zdGFuY2VUeXBlLm9mKFxuICAgICAgICBlYzIuSW5zdGFuY2VDbGFzcy5CVVJTVEFCTEUzLFxuICAgICAgICBlYzIuSW5zdGFuY2VTaXplLlNNQUxMXG4gICAgICApLFxuICAgICAgdnBjLFxuICAgICAgZW5naW5lOiByZHMuRGF0YWJhc2VJbnN0YW5jZUVuZ2luZS5teXNxbCh7XG4gICAgICAgIHZlcnNpb246IHJkcy5NeXNxbEVuZ2luZVZlcnNpb24uVkVSXzVfNl8zOSxcbiAgICAgIH0pLFxuICAgICAgcHVibGljbHlBY2Nlc3NpYmxlOiB0cnVlLFxuICAgICAgbXVsdGlBejogZmFsc2UsXG4gICAgICBhbGxvY2F0ZWRTdG9yYWdlOiAxMDAsXG4gICAgICBzdG9yYWdlVHlwZTogcmRzLlN0b3JhZ2VUeXBlLlNUQU5EQVJELFxuICAgICAgY2xvdWR3YXRjaExvZ3NFeHBvcnRzOiBbXCJhdWRpdFwiLCBcImVycm9yXCIsIFwiZ2VuZXJhbFwiXSxcbiAgICAgIGRhdGFiYXNlTmFtZTogXCJteVNxbERhdGFCYXNlXCIsXG4gICAgICBkZWxldGlvblByb3RlY3Rpb246IGZhbHNlLFxuICAgICAgdnBjUGxhY2VtZW50OiB7IHN1Ym5ldFR5cGU6IGVjMi5TdWJuZXRUeXBlLlBVQkxJQyB9LFxuICAgICAgLy8gQnkgZGVmYXVsdCBEYXRhYmFzZUluc3RhbmNlIGNyZWF0ZSBwYXNzd29yZCBhbmQgdXNlcm5hbWU6XCJhZG1pblwiIGluIHNlY3JldHMgbWFuYWdlciwgY2FuIHByb3ZpZGUgY3VzdG9tIGNyZWRlbnRpYWxzIGFmdGVyIGNyZWF0aW5nIGN1c3RvbSBzZWNyZXRcbiAgICAgIC8vIGNyZWRlbnRpYWxzOiB7XG4gICAgICAvLyAgIHVzZXJuYW1lOiBcImFkbWluXCIsXG4gICAgICAvLyBwYXNzd29yZDogU00uU2VjcmV0LmZyb21TZWNyZXRBdHRyaWJ1dGVzKHRoaXMsIFwiRXhTZWNyZXRLZXlcIiwge1xuICAgICAgLy8gICBzZWNyZXRBcm46IHNlY3JldC5zZWNyZXRBcm4sXG4gICAgICAvLyB9KS5zZWNyZXRWYWx1ZSxcbiAgICAgIC8vIH0sXG4gICAgfSk7XG5cbiAgICAvLyAgZm9yIGxhbWJkYSBSRFMgYW5kIFZQQyBhY2Nlc3NcbiAgICBjb25zdCByb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsIFwiTGFtYmRhUm9sZVwiLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBpYW0uU2VydmljZVByaW5jaXBhbChcImxhbWJkYS5hbWF6b25hd3MuY29tXCIpLFxuICAgICAgbWFuYWdlZFBvbGljaWVzOiBbXG4gICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkFtYXpvblJEU0RhdGFGdWxsQWNjZXNzXCIpLFxuICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXG4gICAgICAgICAgXCJzZXJ2aWNlLXJvbGUvQVdTTGFtYmRhVlBDQWNjZXNzRXhlY3V0aW9uUm9sZVwiXG4gICAgICAgICksXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgY29uc3QgZm8gPSBteURCSW5zdGFuY2Uuc2VjcmV0Py5zZWNyZXROYW1lLnRvU3RyaW5nKCkgfHwgXCJra1wiO1xuICAgIGNvbnN0IGZvbyA9IG15REJJbnN0YW5jZS5zZWNyZXQ/LnNlY3JldEFybiB8fCBcImZvb29vXCI7XG5cbiAgICAvLyAgY3JlYXRlIGEgZnVuY3Rpb24gdG8gYWNjZXNzIGRhdGFiYXNlIFxuICAgIGNvbnN0IGhlbGxvID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcIkhlbGxvSGFuZGxlclwiLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMTBfWCxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChcImxhbWJkYS9sYW1iZGEtcC56aXBcIiksXG4gICAgICBoYW5kbGVyOiBcImluZGV4LmhhbmRsZXJcIixcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5taW51dGVzKDEpLFxuICAgICAgdnBjLFxuICAgICAgcm9sZSxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIHZhbGE6IGAke1xuICAgICAgICAgIFNNLlNlY3JldC5mcm9tU2VjcmV0QXR0cmlidXRlcyh0aGlzLCBcInNuYVwiLCB7IHNlY3JldEFybjogZm9vIH0pXG4gICAgICAgICAgICAuc2VjcmV0VmFsdWVcbiAgICAgICAgfWAsXG4gICAgICAgIEhPU1Q6IG15REJJbnN0YW5jZS5kYkluc3RhbmNlRW5kcG9pbnRBZGRyZXNzLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vICBjcmVhdGUgbGFtYmRhIG9uY2UgZGJpbnN0YW5jZSBpcyBjcmVhdGVkIFxuICAgIGhlbGxvLm5vZGUuYWRkRGVwZW5kZW5jeShteURCSW5zdGFuY2UpO1xuXG4gICAgLy8gIGFsbG93IGxhbWJkYSB0byBjb25uZWN0IHRvIHRoZSBkYXRhYmFzZSBpbnN0YW5jZVxuXG4gICAgbXlEQkluc3RhbmNlLmdyYW50Q29ubmVjdChyb2xlKTtcblxufX07XG5cblxuIl19