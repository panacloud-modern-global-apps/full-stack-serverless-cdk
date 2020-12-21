## Introduction to Amazon Pinpoint

Amazon Pinpoint is a flexible and scalable outbound and inbound marketing communications service. You can connect with customers over channels like email, SMS, push, or voice. Amazon Pinpoint is easy to set up, easy to use, and is flexible for all marketing communication scenarios. Segment your campaign audience for the right customer and personalize your messages with the right content. Delivery and campaign metrics in Amazon Pinpoint measure the success of your communications.

## Why Amazon Pinpoint

You can connect with customers over channels like email, SMS, push, or voice. Amazon Pinpoint is easy to set up, easy to use, and is flexible for all marketing communication scenarios. Amazon Pinpoint can grow with you and scales globally to billions of messages per day across channels.

## Code explanation

Just creating the role that will attach to the lambda function

```javascript
const role = new Role(this, "LambdaRole", {
  assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
});
```

Defining policy that will be granting access to send message operation of pinpoint and all the cloudwatch logs events. Logs permissions are default but if we define a role to the resource so all the default policies will be override.

```javascript
role.addToPolicy(
  new PolicyStatement({
    actions: ["mobiletargeting:SendMessages", "logs:*"],
    resources: ["*"],
  })
);
```

Create a Pinpoint project and also enable Email channel to send emails.

```javascript
const pinpointProject = new pinpoint.CfnApp(this, "project", {
  name: "PinpointInPractice",
});
//  Enable Email Channel to send emails
const emailChannel = new pinpoint.CfnEmailChannel(this, "PinpointEmailCh", {
  applicationId: "APP_ID",
  enabled: true,
  fromAddress: "EMAIL_ADDRESS",
  // The Amazon Resource Name (ARN) of the identity, verified with Amazon Simple Email Service (Amazon SES),
  // that you want to use when you send email through the channel.
  identity: "IDENTITY",
});
```

In this project we have used Lambda as a datasource which means our resolver will interact with lambda function for data operations.

```javascript
// lambda function
const Lambda = new lambda.Function(this, "Pinpoint-In-Pracitce", {
  runtime: lambda.Runtime.NODEJS_12_X,
  handler: "main.handler",
  role: role, ///Defining role to Lambda
  code: lambda.Code.fromAsset("lambda"),
  memorySize: 1024,
});

//  Adding lambda as a dataSource
const lambdaDs = api.addLambdaDataSource("lambdaDataSource", Lambda);

//  Creating a Resolver
lambdaDs.createResolver({
  typeName: "Mutation",
  fieldName: "createEmail",
});
```

Now we have configured Pinpoint API in `main.ts`. Pinpiont is only available in some of [region](https://docs.aws.amazon.com/pinpoint/latest/apireference/).

```javascript
// The AWS Region that you want to use to send the email. For a list of
// AWS Regions where the Amazon Pinpoint API is available, see
// https://docs.aws.amazon.com/pinpoint/latest/apireference/
AWS.config.update({ region: "us-west-2" });

var pinpoint = new AWS.Pinpoint({ apiVersion: "2016-12-01" });
```

We have Specify the parameters to pass to the Pinpoint API.

```javascript
var params = {
  ApplicationId: appId,
  MessageRequest: {
    Addresses: {
      [toAddress]: {
        ChannelType: "EMAIL",
      },
    },
    MessageConfiguration: {
      EmailMessage: {
        FromAddress: senderAddress,
        SimpleEmail: {
          Subject: {
            Data: subject,
          },
          HtmlPart: {
            Data: body_html,
          },
          TextPart: {
            Data: body_text,
          },
        },
      },
    },
  },
};
```

Now we have send an email by passing the parameters which we specify before.

```javascript
var publish = await pinpoint.sendMessages(params).promise();
```

## Reference Links

[AWS Pinpoint](https://aws.amazon.com/pinpoint/)
[AWS Pinpoint CDK Documatation](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-pinpoint-readme.html)
[AWS Pinpoint API reference](https://docs.aws.amazon.com/pinpoint/latest/apireference/welcome.html)

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
