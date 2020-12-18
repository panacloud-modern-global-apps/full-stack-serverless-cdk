# Granting IAM policies to Resources

![alt text](https://github.com/panacloud-modern-global-apps/full-stack-serverless-cdk/blob/main/step11_grant_iam_policy_to_resources/img/iam.png)

You manage access in AWS by creating policies and attaching them to IAM identities (users, groups of users, or roles) or AWS resources. A policy is an object in AWS that, when associated with an identity or resource, defines their permissions. AWS evaluates these policies when an IAM principal (user or role) makes a request. Permissions in the policies determine whether the request is allowed or denied.

## Why IAM Policy?
For a tight security reason AWS don't allow one resource to access another resource without any permissions. What we are doing here is creating a role and grant some permissions and policies to that particular role then attach that role to a particular resource.

# Code explanation

Just creating the role that will attach to the lambda function

```javascript
    const role = new Role(this, 'LambdaRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    });
```
Defining policy that will be granting access to all the operations of dynamodb and all the cloudwatch logs events. Logs permissions are default but if we define a role to the resource so all the default policies will be override.

```javascript
    const policy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['dynamodb:*', "logs:*"],
      resources: ['*']
    });
```

Assigning role to lambda function

```javascript
     const lambda_function = new lambda.Function(this, "LambdaFucntion", {
      ///....
      role: role,
      ///...
    })
```


[AWS Identity and Access Management Construct Library](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-iam-readme.html)

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
