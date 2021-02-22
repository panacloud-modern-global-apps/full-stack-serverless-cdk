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
        var _a;
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
        const dbcreds = ((_a = myDBInstance.secret) === null || _a === void 0 ? void 0 : _a.secretArn) || "dbcreds";
        //  create a function to access database 
        const hello = new lambda.Function(this, "HelloHandler", {
            runtime: lambda.Runtime.PYTHON_3_7,
            code: lambda.Code.fromAsset("lambda/lambdazip.zip"),
            handler: "index.handler",
            timeout: cdk.Duration.minutes(1),
            vpc,
            role,
            environment: {
                INSTANCE_CREDENTIALS: `${SM.Secret.fromSecretAttributes(this, "dbcredentials", { secretArn: dbcreds })
                    .secretValue}`,
                HOST: myDBInstance.dbInstanceEndpointAddress,
            },
        });
        //  create lambda once dbinstance is created 
        hello.node.addDependency(myDBInstance);
        //  allow lambda to connect to the database instance
        myDBInstance.grantConnect(hello);
        // To control who can access the cluster or instance, use the .connections attribute. RDS databases have a default port: 3306
        myDBInstance.connections.allowFromAnyIpv4(ec2.Port.tcp(3306));
        new cdk.CfnOutput(this, "endpoint", {
            value: myDBInstance.dbInstanceEndpointAddress,
        });
    }
}
exports.BackStack = BackStack;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFjay1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhY2stc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUNBQXFDO0FBQ3JDLHdDQUF3QztBQUN4Qyx3Q0FBd0M7QUFDeEMsOENBQThDO0FBQzlDLGtEQUFrRDtBQUNsRCx3Q0FBd0M7QUFFeEMsTUFBYSxTQUFVLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDdEMsWUFBWSxLQUFvQixFQUFFLEVBQVUsRUFBRSxLQUFzQjs7UUFDbEUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsNkNBQTZDO1FBRTdDLHdDQUF3QztRQUV4QyxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRTFDLDRCQUE0QjtRQUU1QixNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO1lBQzNELFlBQVksRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FDL0IsR0FBRyxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQzVCLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUN2QjtZQUNELEdBQUc7WUFDSCxNQUFNLEVBQUUsR0FBRyxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQztnQkFDdkMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVO2FBQzNDLENBQUM7WUFDRixrQkFBa0IsRUFBRSxJQUFJO1lBQ3hCLE9BQU8sRUFBRSxLQUFLO1lBQ2QsZ0JBQWdCLEVBQUUsR0FBRztZQUNyQixXQUFXLEVBQUUsR0FBRyxDQUFDLFdBQVcsQ0FBQyxRQUFRO1lBQ3JDLHFCQUFxQixFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUM7WUFDcEQsWUFBWSxFQUFFLGVBQWU7WUFDN0Isa0JBQWtCLEVBQUUsS0FBSztZQUN6QixZQUFZLEVBQUUsRUFBRSxVQUFVLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUU7U0FDcEQsQ0FBQyxDQUFDO1FBRUgsaUNBQWlDO1FBQ2pDLE1BQU0sSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQzVDLFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQztZQUMzRCxlQUFlLEVBQUU7Z0JBQ2YsR0FBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyx5QkFBeUIsQ0FBQztnQkFDckUsR0FBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FDeEMsOENBQThDLENBQy9DO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFHSCxNQUFNLE9BQU8sR0FBRyxPQUFBLFlBQVksQ0FBQyxNQUFNLDBDQUFFLFNBQVMsS0FBSSxTQUFTLENBQUM7UUFFNUQseUNBQXlDO1FBQ3pDLE1BQU0sS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO1lBQ3RELE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVU7WUFDbEMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDO1lBQ25ELE9BQU8sRUFBRSxlQUFlO1lBQ3hCLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDaEMsR0FBRztZQUNILElBQUk7WUFDSixXQUFXLEVBQUU7Z0JBQ1Ysb0JBQW9CLEVBQUUsR0FDckIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxDQUFDO3FCQUMxRSxXQUNMLEVBQUU7Z0JBQ0YsSUFBSSxFQUFFLFlBQVksQ0FBQyx5QkFBeUI7YUFDN0M7U0FDRixDQUFDLENBQUM7UUFFSCw2Q0FBNkM7UUFDN0MsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFdkMsb0RBQW9EO1FBRXBELFlBQVksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakMsNkhBQTZIO1FBQzlILFlBQVksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtRQUU3RCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUNyQyxLQUFLLEVBQUUsWUFBWSxDQUFDLHlCQUF5QjtTQUU5QyxDQUFDLENBQUE7SUFDRixDQUFDO0NBQUM7QUEzRUYsOEJBMkVFO0FBQUEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xuaW1wb3J0ICogYXMgcmRzIGZyb20gXCJAYXdzLWNkay9hd3MtcmRzXCI7XG5pbXBvcnQgKiBhcyBlYzIgZnJvbSBcIkBhd3MtY2RrL2F3cy1lYzJcIjtcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tIFwiQGF3cy1jZGsvYXdzLWxhbWJkYVwiO1xuaW1wb3J0ICogYXMgU00gZnJvbSBcIkBhd3MtY2RrL2F3cy1zZWNyZXRzbWFuYWdlclwiO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gXCJAYXdzLWNkay9hd3MtaWFtXCI7XG5cbmV4cG9ydCBjbGFzcyBCYWNrU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkNvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gVGhlIGNvZGUgdGhhdCBkZWZpbmVzIHlvdXIgc3RhY2sgZ29lcyBoZXJlXG5cbiAgICAvLyAgY3JlYXRlIHZwYyBmb3IgdGhlIGRhdGFiYWNlIGluc3RhbmNlXG5cbiAgICBjb25zdCB2cGMgPSBuZXcgZWMyLlZwYyh0aGlzLCBcIm15cmRzdnBjXCIpO1xuXG4gICAgLy8gIGNyZWF0ZSBkYXRhYmFzZSBpbnN0YW5jZVxuXG4gICAgY29uc3QgbXlEQkluc3RhbmNlID0gbmV3IHJkcy5EYXRhYmFzZUluc3RhbmNlKHRoaXMsIFwiTXlTUUxcIiwge1xuICAgICAgaW5zdGFuY2VUeXBlOiBlYzIuSW5zdGFuY2VUeXBlLm9mKFxuICAgICAgICBlYzIuSW5zdGFuY2VDbGFzcy5CVVJTVEFCTEUzLFxuICAgICAgICBlYzIuSW5zdGFuY2VTaXplLlNNQUxMXG4gICAgICApLFxuICAgICAgdnBjLFxuICAgICAgZW5naW5lOiByZHMuRGF0YWJhc2VJbnN0YW5jZUVuZ2luZS5teXNxbCh7XG4gICAgICAgIHZlcnNpb246IHJkcy5NeXNxbEVuZ2luZVZlcnNpb24uVkVSXzVfNl8zOSxcbiAgICAgIH0pLFxuICAgICAgcHVibGljbHlBY2Nlc3NpYmxlOiB0cnVlLFxuICAgICAgbXVsdGlBejogZmFsc2UsXG4gICAgICBhbGxvY2F0ZWRTdG9yYWdlOiAxMDAsXG4gICAgICBzdG9yYWdlVHlwZTogcmRzLlN0b3JhZ2VUeXBlLlNUQU5EQVJELFxuICAgICAgY2xvdWR3YXRjaExvZ3NFeHBvcnRzOiBbXCJhdWRpdFwiLCBcImVycm9yXCIsIFwiZ2VuZXJhbFwiXSxcbiAgICAgIGRhdGFiYXNlTmFtZTogXCJteVNxbERhdGFCYXNlXCIsXG4gICAgICBkZWxldGlvblByb3RlY3Rpb246IGZhbHNlLFxuICAgICAgdnBjUGxhY2VtZW50OiB7IHN1Ym5ldFR5cGU6IGVjMi5TdWJuZXRUeXBlLlBVQkxJQyB9LFxuICAgIH0pO1xuXG4gICAgLy8gIGZvciBsYW1iZGEgUkRTIGFuZCBWUEMgYWNjZXNzXG4gICAgY29uc3Qgcm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCBcIkxhbWJkYVJvbGVcIiwge1xuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoXCJsYW1iZGEuYW1hem9uYXdzLmNvbVwiKSxcbiAgICAgIG1hbmFnZWRQb2xpY2llczogW1xuICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBbWF6b25SRFNEYXRhRnVsbEFjY2Vzc1wiKSxcbiAgICAgICAgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFxuICAgICAgICAgIFwic2VydmljZS1yb2xlL0FXU0xhbWJkYVZQQ0FjY2Vzc0V4ZWN1dGlvblJvbGVcIlxuICAgICAgICApLFxuICAgICAgXSxcbiAgICB9KTtcblxuICBcbiAgICBjb25zdCBkYmNyZWRzID0gbXlEQkluc3RhbmNlLnNlY3JldD8uc2VjcmV0QXJuIHx8IFwiZGJjcmVkc1wiO1xuXG4gICAgLy8gIGNyZWF0ZSBhIGZ1bmN0aW9uIHRvIGFjY2VzcyBkYXRhYmFzZSBcbiAgICBjb25zdCBoZWxsbyA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgXCJIZWxsb0hhbmRsZXJcIiwge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfNyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChcImxhbWJkYS9sYW1iZGF6aXAuemlwXCIpLFxuICAgICAgaGFuZGxlcjogXCJpbmRleC5oYW5kbGVyXCIsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24ubWludXRlcygxKSxcbiAgICAgIHZwYyxcbiAgICAgIHJvbGUsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgSU5TVEFOQ0VfQ1JFREVOVElBTFM6IGAke1xuICAgICAgICAgIFNNLlNlY3JldC5mcm9tU2VjcmV0QXR0cmlidXRlcyh0aGlzLCBcImRiY3JlZGVudGlhbHNcIiwgeyBzZWNyZXRBcm46IGRiY3JlZHMgfSlcbiAgICAgICAgICAgIC5zZWNyZXRWYWx1ZVxuICAgICAgICB9YCxcbiAgICAgICAgSE9TVDogbXlEQkluc3RhbmNlLmRiSW5zdGFuY2VFbmRwb2ludEFkZHJlc3MsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gIGNyZWF0ZSBsYW1iZGEgb25jZSBkYmluc3RhbmNlIGlzIGNyZWF0ZWQgXG4gICAgaGVsbG8ubm9kZS5hZGREZXBlbmRlbmN5KG15REJJbnN0YW5jZSk7XG5cbiAgICAvLyAgYWxsb3cgbGFtYmRhIHRvIGNvbm5lY3QgdG8gdGhlIGRhdGFiYXNlIGluc3RhbmNlXG5cbiAgICBteURCSW5zdGFuY2UuZ3JhbnRDb25uZWN0KGhlbGxvKTtcbiAgICAvLyBUbyBjb250cm9sIHdobyBjYW4gYWNjZXNzIHRoZSBjbHVzdGVyIG9yIGluc3RhbmNlLCB1c2UgdGhlIC5jb25uZWN0aW9ucyBhdHRyaWJ1dGUuIFJEUyBkYXRhYmFzZXMgaGF2ZSBhIGRlZmF1bHQgcG9ydDogMzMwNlxuICAgbXlEQkluc3RhbmNlLmNvbm5lY3Rpb25zLmFsbG93RnJvbUFueUlwdjQoZWMyLlBvcnQudGNwKDMzMDYpKVxuICAgIFxuICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJlbmRwb2ludFwiLCB7XG4gIHZhbHVlOiBteURCSW5zdGFuY2UuZGJJbnN0YW5jZUVuZHBvaW50QWRkcmVzcyxcblxufSlcbn19O1xuXG5cbiJdfQ==