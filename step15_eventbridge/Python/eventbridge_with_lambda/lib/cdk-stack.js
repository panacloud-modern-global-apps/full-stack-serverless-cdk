"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CdkStack = void 0;
const cdk = require("@aws-cdk/core");
const events = require("@aws-cdk/aws-events");
const targets = require("@aws-cdk/aws-events-targets");
const lambda = require("@aws-cdk/aws-lambda");
const apigateway = require("@aws-cdk/aws-apigateway");
class CdkStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // lambda that will produce our custom event.
        const producerFn = new lambda.Function(this, "producerLambda", {
            code: lambda.Code.fromAsset("lambda"),
            handler: "producer.handler",
            runtime: lambda.Runtime.PYTHON_3_7,
        });
        // Grant the lambda permission to put custom events on eventbridge
        events.EventBus.grantPutEvents(producerFn);
        // Api gateway to be able to send custom events from frontend
        const api = new apigateway.LambdaRestApi(this, "testApi", {
            handler: producerFn,
        });
        // The lambda function which our eventbridge rule will trigger when it matches the country as PK
        const consumerFn = new lambda.Function(this, "consumerLambda", {
            runtime: lambda.Runtime.PYTHON_3_7,
            code: lambda.Code.fromAsset("lambda"),
            handler: "consumer.handler",
        });
        // The rule that filters events to match country == "PK" and sends them to the consumer Lambda.
        const PKrule = new events.Rule(this, "orderPKLambda", {
            targets: [new targets.LambdaFunction(consumerFn)],
            description: "Filter events that come from country PK and invoke lambda with it.",
            eventPattern: {
                source: ["custom.api"]
            },
        });
    }
}
exports.CdkStack = CdkStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2RrLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFDQUFxQztBQUNyQyw4Q0FBOEM7QUFDOUMsdURBQXVEO0FBQ3ZELDhDQUE4QztBQUM5QyxzREFBc0Q7QUFHdEQsTUFBYSxRQUFTLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDckMsWUFBWSxLQUFvQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUNsRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4Qiw2Q0FBNkM7UUFDN0MsTUFBTSxVQUFVLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUM3RCxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO1lBQ3JDLE9BQU8sRUFBRSxrQkFBa0I7WUFDM0IsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVTtTQUNuQyxDQUFDLENBQUM7UUFFSCxrRUFBa0U7UUFDbEUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFM0MsNkRBQTZEO1FBQzdELE1BQU0sR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQ3hELE9BQU8sRUFBRSxVQUFVO1NBQ3BCLENBQUMsQ0FBQztRQUVILGdHQUFnRztRQUNoRyxNQUFNLFVBQVUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQzdELE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVU7WUFDbEMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztZQUNyQyxPQUFPLEVBQUUsa0JBQWtCO1NBQzVCLENBQUMsQ0FBQztRQUVILCtGQUErRjtRQUMvRixNQUFNLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUNwRCxPQUFPLEVBQUUsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDakQsV0FBVyxFQUNULG9FQUFvRTtZQUN0RSxZQUFZLEVBQUU7Z0JBQ2QsTUFBTSxFQUFFLENBQUMsWUFBWSxDQUFDO2FBQ3JCO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBcENELDRCQW9DQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xuaW1wb3J0ICogYXMgZXZlbnRzIGZyb20gXCJAYXdzLWNkay9hd3MtZXZlbnRzXCI7XG5pbXBvcnQgKiBhcyB0YXJnZXRzIGZyb20gXCJAYXdzLWNkay9hd3MtZXZlbnRzLXRhcmdldHNcIjtcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tIFwiQGF3cy1jZGsvYXdzLWxhbWJkYVwiO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tIFwiQGF3cy1jZGsvYXdzLWFwaWdhdGV3YXlcIjtcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcblxuZXhwb3J0IGNsYXNzIENka1N0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IGNkay5Db25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vIGxhbWJkYSB0aGF0IHdpbGwgcHJvZHVjZSBvdXIgY3VzdG9tIGV2ZW50LlxuICAgIGNvbnN0IHByb2R1Y2VyRm4gPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsIFwicHJvZHVjZXJMYW1iZGFcIiwge1xuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFwibGFtYmRhXCIpLFxuICAgICAgaGFuZGxlcjogXCJwcm9kdWNlci5oYW5kbGVyXCIsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM183LFxuICAgIH0pO1xuXG4gICAgLy8gR3JhbnQgdGhlIGxhbWJkYSBwZXJtaXNzaW9uIHRvIHB1dCBjdXN0b20gZXZlbnRzIG9uIGV2ZW50YnJpZGdlXG4gICAgZXZlbnRzLkV2ZW50QnVzLmdyYW50UHV0RXZlbnRzKHByb2R1Y2VyRm4pO1xuXG4gICAgLy8gQXBpIGdhdGV3YXkgdG8gYmUgYWJsZSB0byBzZW5kIGN1c3RvbSBldmVudHMgZnJvbSBmcm9udGVuZFxuICAgIGNvbnN0IGFwaSA9IG5ldyBhcGlnYXRld2F5LkxhbWJkYVJlc3RBcGkodGhpcywgXCJ0ZXN0QXBpXCIsIHtcbiAgICAgIGhhbmRsZXI6IHByb2R1Y2VyRm4sXG4gICAgfSk7XG5cbiAgICAvLyBUaGUgbGFtYmRhIGZ1bmN0aW9uIHdoaWNoIG91ciBldmVudGJyaWRnZSBydWxlIHdpbGwgdHJpZ2dlciB3aGVuIGl0IG1hdGNoZXMgdGhlIGNvdW50cnkgYXMgUEtcbiAgICBjb25zdCBjb25zdW1lckZuID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcImNvbnN1bWVyTGFtYmRhXCIsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzcsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoXCJsYW1iZGFcIiksXG4gICAgICBoYW5kbGVyOiBcImNvbnN1bWVyLmhhbmRsZXJcIixcbiAgICB9KTtcblxuICAgIC8vIFRoZSBydWxlIHRoYXQgZmlsdGVycyBldmVudHMgdG8gbWF0Y2ggY291bnRyeSA9PSBcIlBLXCIgYW5kIHNlbmRzIHRoZW0gdG8gdGhlIGNvbnN1bWVyIExhbWJkYS5cbiAgICBjb25zdCBQS3J1bGUgPSBuZXcgZXZlbnRzLlJ1bGUodGhpcywgXCJvcmRlclBLTGFtYmRhXCIsIHtcbiAgICAgIHRhcmdldHM6IFtuZXcgdGFyZ2V0cy5MYW1iZGFGdW5jdGlvbihjb25zdW1lckZuKV0sXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgXCJGaWx0ZXIgZXZlbnRzIHRoYXQgY29tZSBmcm9tIGNvdW50cnkgUEsgYW5kIGludm9rZSBsYW1iZGEgd2l0aCBpdC5cIixcbiAgICAgIGV2ZW50UGF0dGVybjoge1xuICAgICAgc291cmNlOiBbXCJjdXN0b20uYXBpXCJdXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG59XG4iXX0=