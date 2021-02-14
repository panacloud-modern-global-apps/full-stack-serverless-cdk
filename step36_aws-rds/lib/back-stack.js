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
            runtime: lambda.Runtime.NODEJS_10_X,
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
    }
}
exports.BackStack = BackStack;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFjay1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhY2stc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUNBQXFDO0FBQ3JDLHdDQUF3QztBQUN4Qyx3Q0FBd0M7QUFDeEMsOENBQThDO0FBQzlDLGtEQUFrRDtBQUNsRCx3Q0FBd0M7QUFFeEMsTUFBYSxTQUFVLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDdEMsWUFBWSxLQUFvQixFQUFFLEVBQVUsRUFBRSxLQUFzQjs7UUFDbEUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsNkNBQTZDO1FBRTdDLHdDQUF3QztRQUV4QyxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRTFDLDRCQUE0QjtRQUU1QixNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO1lBQzNELFlBQVksRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FDL0IsR0FBRyxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQzVCLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUN2QjtZQUNELEdBQUc7WUFDSCxNQUFNLEVBQUUsR0FBRyxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQztnQkFDdkMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVO2FBQzNDLENBQUM7WUFDRixrQkFBa0IsRUFBRSxJQUFJO1lBQ3hCLE9BQU8sRUFBRSxLQUFLO1lBQ2QsZ0JBQWdCLEVBQUUsR0FBRztZQUNyQixXQUFXLEVBQUUsR0FBRyxDQUFDLFdBQVcsQ0FBQyxRQUFRO1lBQ3JDLHFCQUFxQixFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUM7WUFDcEQsWUFBWSxFQUFFLGVBQWU7WUFDN0Isa0JBQWtCLEVBQUUsS0FBSztZQUN6QixZQUFZLEVBQUUsRUFBRSxVQUFVLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUU7U0FDcEQsQ0FBQyxDQUFDO1FBRUgsaUNBQWlDO1FBQ2pDLE1BQU0sSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQzVDLFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQztZQUMzRCxlQUFlLEVBQUU7Z0JBQ2YsR0FBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyx5QkFBeUIsQ0FBQztnQkFDckUsR0FBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FDeEMsOENBQThDLENBQy9DO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFHSCxNQUFNLE9BQU8sR0FBRyxPQUFBLFlBQVksQ0FBQyxNQUFNLDBDQUFFLFNBQVMsS0FBSSxTQUFTLENBQUM7UUFFNUQseUNBQXlDO1FBQ3pDLE1BQU0sS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO1lBQ3RELE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDO1lBQ25ELE9BQU8sRUFBRSxlQUFlO1lBQ3hCLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDaEMsR0FBRztZQUNILElBQUk7WUFDSixXQUFXLEVBQUU7Z0JBQ1Ysb0JBQW9CLEVBQUUsR0FDckIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxDQUFDO3FCQUMxRSxXQUNMLEVBQUU7Z0JBQ0YsSUFBSSxFQUFFLFlBQVksQ0FBQyx5QkFBeUI7YUFDN0M7U0FDRixDQUFDLENBQUM7UUFFSCw2Q0FBNkM7UUFDN0MsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFdkMsb0RBQW9EO1FBRXBELFlBQVksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakMsNkhBQTZIO1FBQzlILFlBQVksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtJQUdoRSxDQUFDO0NBQUM7QUF4RUYsOEJBd0VFO0FBQUEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xuaW1wb3J0ICogYXMgcmRzIGZyb20gXCJAYXdzLWNkay9hd3MtcmRzXCI7XG5pbXBvcnQgKiBhcyBlYzIgZnJvbSBcIkBhd3MtY2RrL2F3cy1lYzJcIjtcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tIFwiQGF3cy1jZGsvYXdzLWxhbWJkYVwiO1xuaW1wb3J0ICogYXMgU00gZnJvbSBcIkBhd3MtY2RrL2F3cy1zZWNyZXRzbWFuYWdlclwiO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gXCJAYXdzLWNkay9hd3MtaWFtXCI7XG5cbmV4cG9ydCBjbGFzcyBCYWNrU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkNvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gVGhlIGNvZGUgdGhhdCBkZWZpbmVzIHlvdXIgc3RhY2sgZ29lcyBoZXJlXG5cbiAgICAvLyAgY3JlYXRlIHZwYyBmb3IgdGhlIGRhdGFiYWNlIGluc3RhbmNlXG5cbiAgICBjb25zdCB2cGMgPSBuZXcgZWMyLlZwYyh0aGlzLCBcIm15cmRzdnBjXCIpO1xuXG4gICAgLy8gIGNyZWF0ZSBkYXRhYmFzZSBpbnN0YW5jZVxuXG4gICAgY29uc3QgbXlEQkluc3RhbmNlID0gbmV3IHJkcy5EYXRhYmFzZUluc3RhbmNlKHRoaXMsIFwiTXlTUUxcIiwge1xuICAgICAgaW5zdGFuY2VUeXBlOiBlYzIuSW5zdGFuY2VUeXBlLm9mKFxuICAgICAgICBlYzIuSW5zdGFuY2VDbGFzcy5CVVJTVEFCTEUzLFxuICAgICAgICBlYzIuSW5zdGFuY2VTaXplLlNNQUxMXG4gICAgICApLFxuICAgICAgdnBjLFxuICAgICAgZW5naW5lOiByZHMuRGF0YWJhc2VJbnN0YW5jZUVuZ2luZS5teXNxbCh7XG4gICAgICAgIHZlcnNpb246IHJkcy5NeXNxbEVuZ2luZVZlcnNpb24uVkVSXzVfNl8zOSxcbiAgICAgIH0pLFxuICAgICAgcHVibGljbHlBY2Nlc3NpYmxlOiB0cnVlLFxuICAgICAgbXVsdGlBejogZmFsc2UsXG4gICAgICBhbGxvY2F0ZWRTdG9yYWdlOiAxMDAsXG4gICAgICBzdG9yYWdlVHlwZTogcmRzLlN0b3JhZ2VUeXBlLlNUQU5EQVJELFxuICAgICAgY2xvdWR3YXRjaExvZ3NFeHBvcnRzOiBbXCJhdWRpdFwiLCBcImVycm9yXCIsIFwiZ2VuZXJhbFwiXSxcbiAgICAgIGRhdGFiYXNlTmFtZTogXCJteVNxbERhdGFCYXNlXCIsXG4gICAgICBkZWxldGlvblByb3RlY3Rpb246IGZhbHNlLFxuICAgICAgdnBjUGxhY2VtZW50OiB7IHN1Ym5ldFR5cGU6IGVjMi5TdWJuZXRUeXBlLlBVQkxJQyB9LFxuICAgIH0pO1xuXG4gICAgLy8gIGZvciBsYW1iZGEgUkRTIGFuZCBWUEMgYWNjZXNzXG4gICAgY29uc3Qgcm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCBcIkxhbWJkYVJvbGVcIiwge1xuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoXCJsYW1iZGEuYW1hem9uYXdzLmNvbVwiKSxcbiAgICAgIG1hbmFnZWRQb2xpY2llczogW1xuICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBbWF6b25SRFNEYXRhRnVsbEFjY2Vzc1wiKSxcbiAgICAgICAgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFxuICAgICAgICAgIFwic2VydmljZS1yb2xlL0FXU0xhbWJkYVZQQ0FjY2Vzc0V4ZWN1dGlvblJvbGVcIlxuICAgICAgICApLFxuICAgICAgXSxcbiAgICB9KTtcblxuICBcbiAgICBjb25zdCBkYmNyZWRzID0gbXlEQkluc3RhbmNlLnNlY3JldD8uc2VjcmV0QXJuIHx8IFwiZGJjcmVkc1wiO1xuXG4gICAgLy8gIGNyZWF0ZSBhIGZ1bmN0aW9uIHRvIGFjY2VzcyBkYXRhYmFzZSBcbiAgICBjb25zdCBoZWxsbyA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgXCJIZWxsb0hhbmRsZXJcIiwge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzEwX1gsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoXCJsYW1iZGEvbGFtYmRhemlwLnppcFwiKSxcbiAgICAgIGhhbmRsZXI6IFwiaW5kZXguaGFuZGxlclwiLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoMSksXG4gICAgICB2cGMsXG4gICAgICByb2xlLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgIElOU1RBTkNFX0NSRURFTlRJQUxTOiBgJHtcbiAgICAgICAgICBTTS5TZWNyZXQuZnJvbVNlY3JldEF0dHJpYnV0ZXModGhpcywgXCJkYmNyZWRlbnRpYWxzXCIsIHsgc2VjcmV0QXJuOiBkYmNyZWRzIH0pXG4gICAgICAgICAgICAuc2VjcmV0VmFsdWVcbiAgICAgICAgfWAsXG4gICAgICAgIEhPU1Q6IG15REJJbnN0YW5jZS5kYkluc3RhbmNlRW5kcG9pbnRBZGRyZXNzLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vICBjcmVhdGUgbGFtYmRhIG9uY2UgZGJpbnN0YW5jZSBpcyBjcmVhdGVkIFxuICAgIGhlbGxvLm5vZGUuYWRkRGVwZW5kZW5jeShteURCSW5zdGFuY2UpO1xuXG4gICAgLy8gIGFsbG93IGxhbWJkYSB0byBjb25uZWN0IHRvIHRoZSBkYXRhYmFzZSBpbnN0YW5jZVxuXG4gICAgbXlEQkluc3RhbmNlLmdyYW50Q29ubmVjdChoZWxsbyk7XG4gICAgLy8gVG8gY29udHJvbCB3aG8gY2FuIGFjY2VzcyB0aGUgY2x1c3RlciBvciBpbnN0YW5jZSwgdXNlIHRoZSAuY29ubmVjdGlvbnMgYXR0cmlidXRlLiBSRFMgZGF0YWJhc2VzIGhhdmUgYSBkZWZhdWx0IHBvcnQ6IDMzMDZcbiAgIG15REJJbnN0YW5jZS5jb25uZWN0aW9ucy5hbGxvd0Zyb21BbnlJcHY0KGVjMi5Qb3J0LnRjcCgzMzA2KSlcbiAgICBcblxufX07XG5cblxuIl19