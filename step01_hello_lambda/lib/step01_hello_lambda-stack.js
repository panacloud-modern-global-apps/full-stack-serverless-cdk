"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Step01HelloLambdaStack = void 0;
const cdk = require("@aws-cdk/core");
const lambda = require("@aws-cdk/aws-lambda");
const apigw = require("@aws-cdk/aws-apigateway");
class Step01HelloLambdaStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // The code that defines your stack goes here
        const hello = new lambda.Function(this, "HelloHandler", {
            runtime: lambda.Runtime.NODEJS_10_X,
            code: lambda.Code.fromAsset("lambda"),
            handler: "hello.handler",
        });
        new apigw.LambdaRestApi(this, "Endpoint", {
            handler: hello,
        });
    }
}
exports.Step01HelloLambdaStack = Step01HelloLambdaStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlcDAxX2hlbGxvX2xhbWJkYS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN0ZXAwMV9oZWxsb19sYW1iZGEtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUNBQXFDO0FBQ3JDLDhDQUE4QztBQUM5QyxpREFBaUQ7QUFFakQsTUFBYSxzQkFBdUIsU0FBUSxHQUFHLENBQUMsS0FBSztJQUNuRCxZQUFZLEtBQW9CLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQ2xFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLDZDQUE2QztRQUM3QyxNQUFNLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUN0RCxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7WUFDckMsT0FBTyxFQUFFLGVBQWU7U0FDekIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7WUFDeEMsT0FBTyxFQUFFLEtBQUs7U0FDZixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFmRCx3REFlQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xyXG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSBcIkBhd3MtY2RrL2F3cy1sYW1iZGFcIjtcclxuaW1wb3J0ICogYXMgYXBpZ3cgZnJvbSBcIkBhd3MtY2RrL2F3cy1hcGlnYXRld2F5XCI7XHJcblxyXG5leHBvcnQgY2xhc3MgU3RlcDAxSGVsbG9MYW1iZGFTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XHJcbiAgY29uc3RydWN0b3Ioc2NvcGU6IGNkay5Db25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcclxuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xyXG5cclxuICAgIC8vIFRoZSBjb2RlIHRoYXQgZGVmaW5lcyB5b3VyIHN0YWNrIGdvZXMgaGVyZVxyXG4gICAgY29uc3QgaGVsbG8gPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsIFwiSGVsbG9IYW5kbGVyXCIsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzEwX1gsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChcImxhbWJkYVwiKSxcclxuICAgICAgaGFuZGxlcjogXCJoZWxsby5oYW5kbGVyXCIsXHJcbiAgICB9KTtcclxuXHJcbiAgICBuZXcgYXBpZ3cuTGFtYmRhUmVzdEFwaSh0aGlzLCBcIkVuZHBvaW50XCIsIHtcclxuICAgICAgaGFuZGxlcjogaGVsbG8sXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuIl19