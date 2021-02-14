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
        //  create database cluster
        const myServerlessDB = new rds.ServerlessCluster(this, "ServerlessDB", {
            vpc,
            engine: rds.DatabaseClusterEngine.auroraMysql({
                version: rds.AuroraMysqlEngineVersion.VER_5_7_12,
            }),
            scaling: {
                autoPause: cdk.Duration.minutes(10),
                minCapacity: rds.AuroraCapacityUnit.ACU_8,
                maxCapacity: rds.AuroraCapacityUnit.ACU_32,
            },
            deletionProtection: false,
            defaultDatabaseName: "mysqldb",
        });
        //  for lambda RDS and VPC access
        const role = new iam.Role(this, "LambdaRole", {
            assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonRDSDataFullAccess"),
                iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaVPCAccessExecutionRole"),
            ],
        });
        const secarn = ((_a = myServerlessDB.secret) === null || _a === void 0 ? void 0 : _a.secretArn) || "secret-arn";
        //  create a function to access database
        const hello = new lambda.Function(this, "HelloHandler", {
            runtime: lambda.Runtime.NODEJS_10_X,
            code: lambda.Code.fromAsset("lambda/lambdazip.zip"),
            handler: "index.handler",
            timeout: cdk.Duration.minutes(1),
            vpc,
            role,
            environment: {
                INSTANCE_CREDENTIALS: `${SM.Secret.fromSecretAttributes(this, "sec-arn", { secretArn: secarn })
                    .secretValue}`,
            },
        });
        //  create lambda once database is created
        hello.node.addDependency(myServerlessDB);
        //     To control who can access the cluster or instance, use the .connections attribute. RDS databases have a default port: 3306
        myServerlessDB.connections.allowFromAnyIpv4(ec2.Port.tcp(3306));
    }
}
exports.BackStack = BackStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFjay1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhY2stc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUNBQXFDO0FBQ3JDLHdDQUF3QztBQUN4Qyx3Q0FBd0M7QUFDeEMsOENBQThDO0FBQzlDLGtEQUFrRDtBQUNsRCx3Q0FBd0M7QUFFeEMsTUFBYSxTQUFVLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDdEMsWUFBWSxLQUFvQixFQUFFLEVBQVUsRUFBRSxLQUFzQjs7UUFDbEUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsNkNBQTZDO1FBRTdDLHdDQUF3QztRQUV4QyxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRTFDLDJCQUEyQjtRQUUzQixNQUFNLGNBQWMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO1lBQ3JFLEdBQUc7WUFDSCxNQUFNLEVBQUUsR0FBRyxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQztnQkFDNUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxVQUFVO2FBQ2pELENBQUM7WUFDRixPQUFPLEVBQUU7Z0JBQ1AsU0FBUyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDbkMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLO2dCQUN6QyxXQUFXLEVBQUUsR0FBRyxDQUFDLGtCQUFrQixDQUFDLE1BQU07YUFDM0M7WUFDRCxrQkFBa0IsRUFBRSxLQUFLO1lBQ3pCLG1CQUFtQixFQUFFLFNBQVM7U0FDL0IsQ0FBQyxDQUFDO1FBRUgsaUNBQWlDO1FBQ2pDLE1BQU0sSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQzVDLFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQztZQUMzRCxlQUFlLEVBQUU7Z0JBQ2YsR0FBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyx5QkFBeUIsQ0FBQztnQkFDckUsR0FBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FDeEMsOENBQThDLENBQy9DO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFFSCxNQUFNLE1BQU0sR0FBRyxPQUFBLGNBQWMsQ0FBQyxNQUFNLDBDQUFFLFNBQVMsS0FBSSxZQUFZLENBQUM7UUFFaEUsd0NBQXdDO1FBQ3hDLE1BQU0sS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO1lBQ3RELE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDO1lBQ25ELE9BQU8sRUFBRSxlQUFlO1lBQ3hCLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDaEMsR0FBRztZQUNILElBQUk7WUFDSixXQUFXLEVBQUU7Z0JBQ1gsb0JBQW9CLEVBQUUsR0FDcEIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxDQUFDO3FCQUNuRSxXQUNMLEVBQUU7YUFDSDtTQUNGLENBQUMsQ0FBQztRQUVILDBDQUEwQztRQUMxQyxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUV6QyxpSUFBaUk7UUFFakksY0FBYyxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7Q0FDRjtBQTlERCw4QkE4REMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSBcIkBhd3MtY2RrL2NvcmVcIjtcbmltcG9ydCAqIGFzIHJkcyBmcm9tIFwiQGF3cy1jZGsvYXdzLXJkc1wiO1xuaW1wb3J0ICogYXMgZWMyIGZyb20gXCJAYXdzLWNkay9hd3MtZWMyXCI7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSBcIkBhd3MtY2RrL2F3cy1sYW1iZGFcIjtcbmltcG9ydCAqIGFzIFNNIGZyb20gXCJAYXdzLWNkay9hd3Mtc2VjcmV0c21hbmFnZXJcIjtcbmltcG9ydCAqIGFzIGlhbSBmcm9tIFwiQGF3cy1jZGsvYXdzLWlhbVwiO1xuXG5leHBvcnQgY2xhc3MgQmFja1N0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IGNkay5Db25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vIFRoZSBjb2RlIHRoYXQgZGVmaW5lcyB5b3VyIHN0YWNrIGdvZXMgaGVyZVxuXG4gICAgLy8gIGNyZWF0ZSB2cGMgZm9yIHRoZSBkYXRhYmFjZSBpbnN0YW5jZVxuXG4gICAgY29uc3QgdnBjID0gbmV3IGVjMi5WcGModGhpcywgXCJteXJkc3ZwY1wiKTtcblxuICAgIC8vICBjcmVhdGUgZGF0YWJhc2UgY2x1c3RlclxuXG4gICAgY29uc3QgbXlTZXJ2ZXJsZXNzREIgPSBuZXcgcmRzLlNlcnZlcmxlc3NDbHVzdGVyKHRoaXMsIFwiU2VydmVybGVzc0RCXCIsIHtcbiAgICAgIHZwYyxcbiAgICAgIGVuZ2luZTogcmRzLkRhdGFiYXNlQ2x1c3RlckVuZ2luZS5hdXJvcmFNeXNxbCh7XG4gICAgICAgIHZlcnNpb246IHJkcy5BdXJvcmFNeXNxbEVuZ2luZVZlcnNpb24uVkVSXzVfN18xMixcbiAgICAgIH0pLFxuICAgICAgc2NhbGluZzoge1xuICAgICAgICBhdXRvUGF1c2U6IGNkay5EdXJhdGlvbi5taW51dGVzKDEwKSwgLy8gZGVmYXVsdCBpcyB0byBwYXVzZSBhZnRlciA1IG1pbnV0ZXMgb2YgaWRsZSB0aW1lXG4gICAgICAgIG1pbkNhcGFjaXR5OiByZHMuQXVyb3JhQ2FwYWNpdHlVbml0LkFDVV84LCAvLyBkZWZhdWx0IGlzIDIgQXVyb3JhIGNhcGFjaXR5IHVuaXRzIChBQ1VzKVxuICAgICAgICBtYXhDYXBhY2l0eTogcmRzLkF1cm9yYUNhcGFjaXR5VW5pdC5BQ1VfMzIsIC8vIGRlZmF1bHQgaXMgMTYgQXVyb3JhIGNhcGFjaXR5IHVuaXRzIChBQ1VzKVxuICAgICAgfSxcbiAgICAgIGRlbGV0aW9uUHJvdGVjdGlvbjogZmFsc2UsXG4gICAgICBkZWZhdWx0RGF0YWJhc2VOYW1lOiBcIm15c3FsZGJcIixcbiAgICB9KTtcblxuICAgIC8vICBmb3IgbGFtYmRhIFJEUyBhbmQgVlBDIGFjY2Vzc1xuICAgIGNvbnN0IHJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgXCJMYW1iZGFSb2xlXCIsIHtcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKFwibGFtYmRhLmFtYXpvbmF3cy5jb21cIiksXG4gICAgICBtYW5hZ2VkUG9saWNpZXM6IFtcbiAgICAgICAgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQW1hem9uUkRTRGF0YUZ1bGxBY2Nlc3NcIiksXG4gICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcbiAgICAgICAgICBcInNlcnZpY2Utcm9sZS9BV1NMYW1iZGFWUENBY2Nlc3NFeGVjdXRpb25Sb2xlXCJcbiAgICAgICAgKSxcbiAgICAgIF0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBzZWNhcm4gPSBteVNlcnZlcmxlc3NEQi5zZWNyZXQ/LnNlY3JldEFybiB8fCBcInNlY3JldC1hcm5cIjtcblxuICAgIC8vICBjcmVhdGUgYSBmdW5jdGlvbiB0byBhY2Nlc3MgZGF0YWJhc2VcbiAgICBjb25zdCBoZWxsbyA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgXCJIZWxsb0hhbmRsZXJcIiwge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzEwX1gsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoXCJsYW1iZGEvbGFtYmRhemlwLnppcFwiKSxcbiAgICAgIGhhbmRsZXI6IFwiaW5kZXguaGFuZGxlclwiLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoMSksXG4gICAgICB2cGMsXG4gICAgICByb2xlLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgSU5TVEFOQ0VfQ1JFREVOVElBTFM6IGAke1xuICAgICAgICAgIFNNLlNlY3JldC5mcm9tU2VjcmV0QXR0cmlidXRlcyh0aGlzLCBcInNlYy1hcm5cIiwgeyBzZWNyZXRBcm46IHNlY2FybiB9KVxuICAgICAgICAgICAgLnNlY3JldFZhbHVlXG4gICAgICAgIH1gLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vICBjcmVhdGUgbGFtYmRhIG9uY2UgZGF0YWJhc2UgaXMgY3JlYXRlZFxuICAgIGhlbGxvLm5vZGUuYWRkRGVwZW5kZW5jeShteVNlcnZlcmxlc3NEQik7XG5cbiAgICAvLyAgICAgVG8gY29udHJvbCB3aG8gY2FuIGFjY2VzcyB0aGUgY2x1c3RlciBvciBpbnN0YW5jZSwgdXNlIHRoZSAuY29ubmVjdGlvbnMgYXR0cmlidXRlLiBSRFMgZGF0YWJhc2VzIGhhdmUgYSBkZWZhdWx0IHBvcnQ6IDMzMDZcblxuICAgIG15U2VydmVybGVzc0RCLmNvbm5lY3Rpb25zLmFsbG93RnJvbUFueUlwdjQoZWMyLlBvcnQudGNwKDMzMDYpKTtcbiAgfVxufVxuIl19