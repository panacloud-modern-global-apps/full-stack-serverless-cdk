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
            code: lambda.Code.fromAsset("lambda/lambda-p.zip"),
            handler: "index.handler",
            timeout: cdk.Duration.minutes(1),
            vpc,
            role,
            environment: {
                val: `${SM.Secret.fromSecretAttributes(this, "sec-arn", { secretArn: secarn })
                    .secretValue}`,
            },
        });
        //  create lambda once dbinstance is created
        hello.node.addDependency(myServerlessDB);
    }
}
exports.BackStack = BackStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFjay1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhY2stc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUNBQXFDO0FBQ3JDLHdDQUF3QztBQUN4Qyx3Q0FBd0M7QUFDeEMsOENBQThDO0FBQzlDLGtEQUFrRDtBQUNsRCx3Q0FBd0M7QUFFeEMsTUFBYSxTQUFVLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDdEMsWUFBWSxLQUFvQixFQUFFLEVBQVUsRUFBRSxLQUFzQjs7UUFDbEUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsNkNBQTZDO1FBRTdDLHdDQUF3QztRQUV4QyxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRTFDLDJCQUEyQjtRQUUzQixNQUFNLGNBQWMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO1lBQ3JFLEdBQUc7WUFDSCxNQUFNLEVBQUUsR0FBRyxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQztnQkFDNUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxVQUFVO2FBQ2pELENBQUM7WUFDRixPQUFPLEVBQUU7Z0JBQ1AsU0FBUyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDbkMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLO2dCQUN6QyxXQUFXLEVBQUUsR0FBRyxDQUFDLGtCQUFrQixDQUFDLE1BQU07YUFDM0M7WUFDRCxrQkFBa0IsRUFBRSxLQUFLO1lBQ3pCLG1CQUFtQixFQUFFLFNBQVM7U0FDL0IsQ0FBQyxDQUFDO1FBRUgsaUNBQWlDO1FBQ2pDLE1BQU0sSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQzVDLFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQztZQUMzRCxlQUFlLEVBQUU7Z0JBQ2YsR0FBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyx5QkFBeUIsQ0FBQztnQkFDckUsR0FBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FDeEMsOENBQThDLENBQy9DO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFFSCxNQUFNLE1BQU0sR0FBRyxPQUFBLGNBQWMsQ0FBQyxNQUFNLDBDQUFFLFNBQVMsS0FBSSxZQUFZLENBQUM7UUFFaEUsd0NBQXdDO1FBQ3hDLE1BQU0sS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO1lBQ3RELE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDO1lBQ2xELE9BQU8sRUFBRSxlQUFlO1lBQ3hCLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDaEMsR0FBRztZQUNILElBQUk7WUFDSixXQUFXLEVBQUU7Z0JBQ1gsR0FBRyxFQUFFLEdBQ0gsRUFBRSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxDQUFDO3FCQUNuRSxXQUNMLEVBQUU7YUFDSDtTQUNGLENBQUMsQ0FBQztRQUVILDRDQUE0QztRQUM1QyxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUMzQyxDQUFDO0NBQ0Y7QUExREQsOEJBMERDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gXCJAYXdzLWNkay9jb3JlXCI7XG5pbXBvcnQgKiBhcyByZHMgZnJvbSBcIkBhd3MtY2RrL2F3cy1yZHNcIjtcbmltcG9ydCAqIGFzIGVjMiBmcm9tIFwiQGF3cy1jZGsvYXdzLWVjMlwiO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gXCJAYXdzLWNkay9hd3MtbGFtYmRhXCI7XG5pbXBvcnQgKiBhcyBTTSBmcm9tIFwiQGF3cy1jZGsvYXdzLXNlY3JldHNtYW5hZ2VyXCI7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSBcIkBhd3MtY2RrL2F3cy1pYW1cIjtcblxuZXhwb3J0IGNsYXNzIEJhY2tTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvLyBUaGUgY29kZSB0aGF0IGRlZmluZXMgeW91ciBzdGFjayBnb2VzIGhlcmVcblxuICAgIC8vICBjcmVhdGUgdnBjIGZvciB0aGUgZGF0YWJhY2UgaW5zdGFuY2VcblxuICAgIGNvbnN0IHZwYyA9IG5ldyBlYzIuVnBjKHRoaXMsIFwibXlyZHN2cGNcIik7XG5cbiAgICAvLyAgY3JlYXRlIGRhdGFiYXNlIGNsdXN0ZXJcblxuICAgIGNvbnN0IG15U2VydmVybGVzc0RCID0gbmV3IHJkcy5TZXJ2ZXJsZXNzQ2x1c3Rlcih0aGlzLCBcIlNlcnZlcmxlc3NEQlwiLCB7XG4gICAgICB2cGMsXG4gICAgICBlbmdpbmU6IHJkcy5EYXRhYmFzZUNsdXN0ZXJFbmdpbmUuYXVyb3JhTXlzcWwoe1xuICAgICAgICB2ZXJzaW9uOiByZHMuQXVyb3JhTXlzcWxFbmdpbmVWZXJzaW9uLlZFUl81XzdfMTIsXG4gICAgICB9KSxcbiAgICAgIHNjYWxpbmc6IHtcbiAgICAgICAgYXV0b1BhdXNlOiBjZGsuRHVyYXRpb24ubWludXRlcygxMCksIC8vIGRlZmF1bHQgaXMgdG8gcGF1c2UgYWZ0ZXIgNSBtaW51dGVzIG9mIGlkbGUgdGltZVxuICAgICAgICBtaW5DYXBhY2l0eTogcmRzLkF1cm9yYUNhcGFjaXR5VW5pdC5BQ1VfOCwgLy8gZGVmYXVsdCBpcyAyIEF1cm9yYSBjYXBhY2l0eSB1bml0cyAoQUNVcylcbiAgICAgICAgbWF4Q2FwYWNpdHk6IHJkcy5BdXJvcmFDYXBhY2l0eVVuaXQuQUNVXzMyLCAvLyBkZWZhdWx0IGlzIDE2IEF1cm9yYSBjYXBhY2l0eSB1bml0cyAoQUNVcylcbiAgICAgIH0sXG4gICAgICBkZWxldGlvblByb3RlY3Rpb246IGZhbHNlLFxuICAgICAgZGVmYXVsdERhdGFiYXNlTmFtZTogXCJteXNxbGRiXCIsXG4gICAgfSk7XG5cbiAgICAvLyAgZm9yIGxhbWJkYSBSRFMgYW5kIFZQQyBhY2Nlc3NcbiAgICBjb25zdCByb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsIFwiTGFtYmRhUm9sZVwiLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBpYW0uU2VydmljZVByaW5jaXBhbChcImxhbWJkYS5hbWF6b25hd3MuY29tXCIpLFxuICAgICAgbWFuYWdlZFBvbGljaWVzOiBbXG4gICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkFtYXpvblJEU0RhdGFGdWxsQWNjZXNzXCIpLFxuICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXG4gICAgICAgICAgXCJzZXJ2aWNlLXJvbGUvQVdTTGFtYmRhVlBDQWNjZXNzRXhlY3V0aW9uUm9sZVwiXG4gICAgICAgICksXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgY29uc3Qgc2VjYXJuID0gbXlTZXJ2ZXJsZXNzREIuc2VjcmV0Py5zZWNyZXRBcm4gfHwgXCJzZWNyZXQtYXJuXCI7XG5cbiAgICAvLyAgY3JlYXRlIGEgZnVuY3Rpb24gdG8gYWNjZXNzIGRhdGFiYXNlXG4gICAgY29uc3QgaGVsbG8gPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsIFwiSGVsbG9IYW5kbGVyXCIsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xMF9YLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFwibGFtYmRhL2xhbWJkYS1wLnppcFwiKSxcbiAgICAgIGhhbmRsZXI6IFwiaW5kZXguaGFuZGxlclwiLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoMSksXG4gICAgICB2cGMsXG4gICAgICByb2xlLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgdmFsOiBgJHtcbiAgICAgICAgICBTTS5TZWNyZXQuZnJvbVNlY3JldEF0dHJpYnV0ZXModGhpcywgXCJzZWMtYXJuXCIsIHsgc2VjcmV0QXJuOiBzZWNhcm4gfSlcbiAgICAgICAgICAgIC5zZWNyZXRWYWx1ZVxuICAgICAgICB9YCxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyAgY3JlYXRlIGxhbWJkYSBvbmNlIGRiaW5zdGFuY2UgaXMgY3JlYXRlZFxuICAgIGhlbGxvLm5vZGUuYWRkRGVwZW5kZW5jeShteVNlcnZlcmxlc3NEQik7XG4gIH1cbn1cbiJdfQ==