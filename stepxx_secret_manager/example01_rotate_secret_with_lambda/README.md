# Secretsmanager Secret with Custom Rotation Lambda Function

AWS Secrets Manager helps you protect secrets needed to access your applications, services, and IT resources. The service enables you to easily rotate, manage, and retrieve database credentials, API keys, and other secrets throughout their lifecycle. Users and applications retrieve secrets with a call to Secrets Manager APIs, eliminating the need to hardcode sensitive information in plain text. Secrets Manager offers secret rotation with built-in integration for Amazon RDS, Amazon Redshift, and Amazon DocumentDB. Also, the service is extensible to other types of secrets, including API keys and OAuth tokens. In addition, Secrets Manager enables you to control access to secrets using fine-grained permissions and audit secret rotation centrally for resources in the AWS Cloud, third-party services, and on-premises.

In software practice it is pretty common to create some secret and use for different use cases. In some cases only one value used to encrypt data and then to decrypt it on receiver. For this case it is enough to create just one secret value.

Lambda would be called 4 times for each Step value. For current implementation only first step would be used createSecret. And within implementation newly generated secret would be set with AWSCURRENT version. This would effectively change label for existing key to AWSPREVIOUS.

## Code Overview

```javascript
     const secret = new secretsmanager.Secret(this, 'Secret', {
      description: "My Secret",
      secretName: 'example-secret',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: "SecretKey",
      }
    });
```

1. Secret - would create new secret value using name secretName. And by Providing generateSecretString it would generate initial json structure with one additional key using value from SecretKey. In secretStringTemplate specified just empty json '{}' so initially secret would looks like this:

```
    {
        "SecretKey":"<some random string>" 
    }
```

2. But immediately after keys rotation Lambda resource created, it would be executed and receive value from function implementation:

```
    {"keyInSecret":"d2a74cd6fa4162ec6eccf75fdf281745a9ca3a8c5f7c736937b9ef360b56c7ef"}
```

3. Function (LambdaSecretRotate) would represent attached rotation lambda with implementation from directory ./lambda. Except pretty common attributes few environment variables passed into:

``` javascript
    environment: {
        REGION: cdk.Stack.of(this).region,
        SECRET_NAME: "example-secret",
        KEY_IN_SECRET_NAME: "SecretKey"
    }
```

4. To determine what key to update and what key within SecretString json to update.

- `RotationSchedule` Would instruct to use specified Lambda and run it every 24 hours

- Necessary roles to allow SecretsManager to call Lambda and Lambda to update secret value

``` javascript
    secret.grantRead(lambdaFunc);
    lambdaFunc.grantInvoke(new iam.ServicePrincipal('secretsmanager.amazonaws.com'))
    lambdaFunc.addToRolePolicy(new iam.PolicyStatement({
      resources: [secret.secretArn],
      actions: ['secretsmanager:PutSecretValue']
    }));
```

5. 

`handler` function has one useful processing attached to `createSecret` Step. Within it generated new secret using randomBytes(32).toString('hex') (ps. Secret length would be 64). Then it saved into SECRET_NAME with AWSCURRENT version which would make it available for use.

``` javascript
    export async function handler(event: Event) {
        if (event.Step === 'createSecret') {
            await secretsManager
                .putSecretValue({
                    SecretId: secretName,
                    SecretString: JSON.stringify({
                        [keyInSecret]: randomBytes(32).toString('hex')
                    }),
                    VersionStages: ['AWSCURRENT']
                })
                .promise()
        }
    }
```

When CDK application deployed secret my-secret-name-here would be available immediately with some randomly generated value. After some short period of time Lambda would be executed and secret would receive final structure.