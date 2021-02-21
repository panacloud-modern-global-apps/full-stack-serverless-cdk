"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonStack = void 0;
const cdk = require("@aws-cdk/core");
const lambda = require("@aws-cdk/aws-lambda");
const apigw = require("@aws-cdk/aws-apigateway");
const aws_iam_1 = require("@aws-cdk/aws-iam");
class PythonStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // The code that defines your stack goes here
        // Creating a IAM role for lambda to give access of ses send email
        const role = new aws_iam_1.Role(this, 'LambdaRole', {
            assumedBy: new aws_iam_1.ServicePrincipal('lambda.amazonaws.com'),
        });
        ///Attaching ses access to policy
        const policy = new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
            actions: ["ses:SendEmail", "ses:SendRawEmail", "logs:*"],
            resources: ['*']
        });
        //granting IAM permissions to role
        role.addToPolicy(policy);
        //  Creating send email lambda handler
        const emailSender = new lambda.Function(this, "HandleSendEmail", {
            runtime: lambda.Runtime.PYTHON_3_6,
            handler: 'main.handler',
            code: lambda.Code.fromAsset('functions'),
            role: role
        });
        // create the API Gateway with one method and path For lambda
        const api = new apigw.RestApi(this, "SendEmailEndPoint");
        api
            .root
            .resourceForPath("sendmail")
            .addMethod("POST", new apigw.LambdaIntegration(emailSender));
        // logging api endpoint
        new cdk.CfnOutput(this, 'Send email endpoint', {
            value: `${api.url}sendmail`
        });
    }
}
exports.PythonStack = PythonStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHl0aG9uLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicHl0aG9uLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFDQUFxQztBQUNyQyw4Q0FBOEM7QUFDOUMsaURBQWlEO0FBQ2pELDhDQUFtRjtBQUNuRixNQUFhLFdBQVksU0FBUSxHQUFHLENBQUMsS0FBSztJQUN4QyxZQUFZLEtBQW9CLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQ2xFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzVCLDZDQUE2QztRQUV6QyxrRUFBa0U7UUFDbEUsTUFBTSxJQUFJLEdBQUcsSUFBSSxjQUFJLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUN4QyxTQUFTLEVBQUUsSUFBSSwwQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQztTQUN4RCxDQUFDLENBQUM7UUFDSCxpQ0FBaUM7UUFDakMsTUFBTSxNQUFNLEdBQUcsSUFBSSx5QkFBZSxDQUFDO1lBQ2pDLE1BQU0sRUFBRSxnQkFBTSxDQUFDLEtBQUs7WUFDcEIsT0FBTyxFQUFFLENBQUMsZUFBZSxFQUFFLGtCQUFrQixFQUFFLFFBQVEsQ0FBQztZQUN4RCxTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUM7U0FDakIsQ0FBQyxDQUFDO1FBQ0gsa0NBQWtDO1FBQ2xDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFekIsc0NBQXNDO1FBQ3RDLE1BQU0sV0FBVyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUU7WUFDL0QsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVTtZQUNsQyxPQUFPLEVBQUUsY0FBYztZQUN2QixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDO1lBQ3hDLElBQUksRUFBRSxJQUFJO1NBQ1gsQ0FBQyxDQUFDO1FBRUgsNkRBQTZEO1FBQzdELE1BQU0sR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLENBQUMsQ0FBQTtRQUN4RCxHQUFHO2FBQ0EsSUFBSTthQUNKLGVBQWUsQ0FBQyxVQUFVLENBQUM7YUFDM0IsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFBO1FBRzlELHVCQUF1QjtRQUN2QixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFO1lBQzdDLEtBQUssRUFBRSxHQUFHLEdBQUcsQ0FBQyxHQUFHLFVBQVU7U0FDNUIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBdkNELGtDQXVDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdAYXdzLWNkay9jb3JlJztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tIFwiQGF3cy1jZGsvYXdzLWxhbWJkYVwiO1xuaW1wb3J0ICogYXMgYXBpZ3cgZnJvbSBcIkBhd3MtY2RrL2F3cy1hcGlnYXRld2F5XCI7XG5pbXBvcnQgeyBFZmZlY3QsIFBvbGljeVN0YXRlbWVudCwgUm9sZSwgU2VydmljZVByaW5jaXBhbCB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1pYW0nO1xuZXhwb3J0IGNsYXNzIFB5dGhvblN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IGNkay5Db25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcbi8vIFRoZSBjb2RlIHRoYXQgZGVmaW5lcyB5b3VyIHN0YWNrIGdvZXMgaGVyZVxuXG4gICAgLy8gQ3JlYXRpbmcgYSBJQU0gcm9sZSBmb3IgbGFtYmRhIHRvIGdpdmUgYWNjZXNzIG9mIHNlcyBzZW5kIGVtYWlsXG4gICAgY29uc3Qgcm9sZSA9IG5ldyBSb2xlKHRoaXMsICdMYW1iZGFSb2xlJywge1xuICAgICAgYXNzdW1lZEJ5OiBuZXcgU2VydmljZVByaW5jaXBhbCgnbGFtYmRhLmFtYXpvbmF3cy5jb20nKSxcbiAgICB9KTtcbiAgICAvLy9BdHRhY2hpbmcgc2VzIGFjY2VzcyB0byBwb2xpY3lcbiAgICBjb25zdCBwb2xpY3kgPSBuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGVmZmVjdDogRWZmZWN0LkFMTE9XLFxuICAgICAgYWN0aW9uczogW1wic2VzOlNlbmRFbWFpbFwiLCBcInNlczpTZW5kUmF3RW1haWxcIiwgXCJsb2dzOipcIl0sXG4gICAgICByZXNvdXJjZXM6IFsnKiddXG4gICAgfSk7XG4gICAgLy9ncmFudGluZyBJQU0gcGVybWlzc2lvbnMgdG8gcm9sZVxuICAgIHJvbGUuYWRkVG9Qb2xpY3kocG9saWN5KTtcblxuICAgIC8vICBDcmVhdGluZyBzZW5kIGVtYWlsIGxhbWJkYSBoYW5kbGVyXG4gICAgY29uc3QgZW1haWxTZW5kZXIgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsIFwiSGFuZGxlU2VuZEVtYWlsXCIsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzYsXG4gICAgICBoYW5kbGVyOiAnbWFpbi5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnZnVuY3Rpb25zJyksXG4gICAgICByb2xlOiByb2xlXG4gICAgfSk7XG5cbiAgICAvLyBjcmVhdGUgdGhlIEFQSSBHYXRld2F5IHdpdGggb25lIG1ldGhvZCBhbmQgcGF0aCBGb3IgbGFtYmRhXG4gICAgY29uc3QgYXBpID0gbmV3IGFwaWd3LlJlc3RBcGkodGhpcywgXCJTZW5kRW1haWxFbmRQb2ludFwiKVxuICAgIGFwaVxuICAgICAgLnJvb3RcbiAgICAgIC5yZXNvdXJjZUZvclBhdGgoXCJzZW5kbWFpbFwiKVxuICAgICAgLmFkZE1ldGhvZChcIlBPU1RcIiwgbmV3IGFwaWd3LkxhbWJkYUludGVncmF0aW9uKGVtYWlsU2VuZGVyKSlcblxuXG4gICAgLy8gbG9nZ2luZyBhcGkgZW5kcG9pbnRcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnU2VuZCBlbWFpbCBlbmRwb2ludCcsIHtcbiAgICAgIHZhbHVlOiBgJHthcGkudXJsfXNlbmRtYWlsYFxuICAgIH0pO1xuICB9XG59XG4iXX0=