# Create a new Secret in a Stack

## Code Overview

In order to have SecretsManager generate a new secret value automatically, you can get started with the following:

```javascript
    const secret = new secretsmanager.Secret(this, 'Secret')
```

Create a role and grant a role permission to use that secret

```javascript
    const role = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    secret.grantRead(role);
```

Now you can use this secret in your lambda function.

If you need to use a pre-existing secret, the recommended way is to manually provision the secret in AWS SecretsManager and use the Secret.fromSecretArn or Secret.fromSecretAttributes method to make it available in your CDK Application.