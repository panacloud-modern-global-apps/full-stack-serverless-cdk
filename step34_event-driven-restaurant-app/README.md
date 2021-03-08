# Event Driven Restaurant App

In this step we are going to make an event driven decoupled restaurant app. For event base architecture we will be using a well known AWS service called Amazon EventBridge which is a serverless event bus that makes it easy to connect applications together using data from your own applications, integrated Software-as-a-Service (SaaS) applications, and AWS services. EventBridge delivers a stream of real-time data from event sources, such as Zendesk, Datadog, or Pagerduty, and routes that data to targets like AWS Lambda. You can set up routing rules to determine where to send your data to build application architectures that react in real time to all of your data sources. Lets start this example first by deploying [cdk-backend](./cdk-backend).

# How to run this App

1. run `cdk deploy --parameter emailParam="email" --parameter phoneNoParam="number"`
  These are the parameters email and phone number to which your sns will subscribe and after deploy you will recieve an email to subscribed to sns.

2. Run gatsby frontend with gatsby develop and don't forgret to add aws-export.js file.

3. after the signup to the userpool with frontend go to the user pool and add only one user to admin group in userpool. This user will be now admin user of the app.
  NOTE: After adding user please logout to ensure that you got an updated session on frontend.

4. Run the application.

# App Flow

1. There are two type of users. Admin and customer.
2. Admin will create booking slots that will be shown to the user.
3. User will select the booking and request will be sent to the Admin.
4. Now admin will accept or decline the booking and according mail will be sent to not the user of the app but the email which is subscribed at a time of cdk deploy.

# Event Driven Flow

On every appsync mutation will send the event to the event bridge which will result in sending the event to it's targeted step functions where we will run two lambda function dynamodbHandler and snsHandler. Dynamodb handler will be responsible for adding data to dynamodb and Sns handler will be responsible for sending email to the subscribed email.

![Application Architecture](application-architecture.jpg)

### Learn more about AWS Eventbridge from the following links:

- [Amazon EventBridge](https://aws.amazon.com/eventbridge/)

- https://github.com/panacloud-modern-global-apps/full-stack-serverless-cdk/tree/main/step15_eventbridge

[Operating Lambda: Design principles in event-driven architectures – Part 2](https://aws.amazon.com/blogs/compute/operating-lambda-design-principles-in-event-driven-architectures-part-2/)

[Step 34 Video in English on Facebook](https://www.facebook.com/zeeshanhanif/videos/10226050958845390)

[Step 34 Video in English on YouTube](https://www.youtube.com/watch?v=wN9-XYyecPI)

[Step 34 Video in Urdu on Facebook](https://www.facebook.com/zeeshanhanif/videos/10226060184996038)

[Step 34 Video in Urdu on YouTube](https://www.youtube.com/watch?v=JCu31cqUrPM)
