# Cloudwatch Alarm with SNS

This step will add a cloudwatch alarm on a mertic exactly like the last step.In this step we will use SNS to send email to an email address on alarm action.

# Code Explanation

### Step1: Install following dependencies

`npm i @aws-cdk/aws-cloudwatch-actions`

`npm i @aws-cdk/aws-sns`

`npm i @aws-cdk/aws-sns-subscriptions`

### Step 2: Create SNS topic 
Add an SNS Topic.Various subscriptions can be added to the topic by calling the .addSubscription(...) method on the topic. It accepts a subscription object, default implementations of which can be found in the @aws-cdk/aws-sns-subscriptions package.Add an Email Subscription to your topic:

```javascript

  const errorTopic = new sns.Topic(this, 'errorTopic');
    errorTopic.addSubscription(
      new subscriptions.EmailSubscription('xyz@email.com'), //Add your email here
    );
    
```

### Step3: Add Alarm Action
To add actions to an alarm, use the integration classes from the @aws-cdk/aws-cloudwatch-actions package. For example, to post a message to an SNS topic when an alarm breaches, do the following:
```javascript

  new cloudwatch.Alarm(this, 'API Gateway 4XX Errors > 1%', {
      metric: apiGateway4xxErrorPercentage,
      threshold: 1,
      evaluationPeriods: 6,
      datapointsToAlarm: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    }).addAlarmAction(new SnsAction(errorTopic));

```
