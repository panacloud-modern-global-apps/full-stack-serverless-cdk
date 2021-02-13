import * as cdk from '@aws-cdk/core';
import * as iotCore from '@aws-cdk/aws-iot';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as iam from '@aws-cdk/aws-iam';

export class BackendIotStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // The code that defines your stack goes here
    
    // create a thing that has the specified thing type and its attributes.
    const thingName = 'MyLightBulb';
    const thing = new iotCore.CfnThing(this,"iotThing",{
      thingName:thingName,
      attributePayload:{
        "attributes":{"wattage":"75"}
      }
    });
    // Attaches a policy to the specified target or thing.
    const policyName = 'MyLightBulb-policy'
    const myPolicy = new iotCore.CfnPolicy(this,"iotThingPolicy",{
      policyName:policyName,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
            {
                Effect: 'Allow',
                Action: 'iot:Connect',
                Resource:`arn:aws:iot:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:thing/${thing.thingName}`,
            },
            {
                Effect: 'Allow',
                Action: 'iot:Subscribe',
                Resource:`arn:aws:iot:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:thing/${thing.thingName}`,
            },
            {
                Effect: 'Allow',
                Action: [
                    'iot:Publish',
                    'iot:Receive',  
                ],
                Resource:`arn:aws:iot:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:thing/${thing.thingName}`,
              },
        ]
        },
    })
    // Attaches the specified principal to the specified thing.
    // A principal can be X.509 certificates, IAM users, groups, and roles, Amazon Cognito identities or federated identities.
    // before attaching principal to thing. make sure you created certificate and pass the certificate ARN in principal attribute.
    const thingPrincipal = new iotCore.CfnThingPrincipalAttachment(this,"myThingPrincipal",{
      principal:'your-certificate-ARN',
      thingName:thingName

    })

    // Attaches the specified principal to the specified policy.
    // A principal can be X.509 certificates, IAM users, groups, and roles, Amazon Cognito identities or federated identities.
    // before attaching principal to policy. make sure you created certificate and pass the certificate ARN in principal attribute.
    const policyPrincipal = new iotCore.CfnPolicyPrincipalAttachment(this,"myPolicyPrincipal",{
      policyName:policyName,
      principal:'your-certificate-ARN',
    })

    // create dynamoDb Table with these attributes to record the data from the imaginary weather sensor devices:
    const dynamoDBTable = new ddb.Table(this, 'Table', {
      tableName:'wx_data',
      partitionKey: {
        name: 'sample_time',
        type: ddb.AttributeType.NUMBER,
      },
      sortKey:{
        name: 'device_id',
        type: ddb.AttributeType.NUMBER,
      }
    });

    // create role for iot to access dynamoDb
    const role = new iam.Role(this, 'wx_ddb_role', {
      assumedBy: new iam.ServicePrincipal('iot.amazonaws.com'),
    });

    ///Attaching DynamoDb access to policy
    const policy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['dynamodb:*'],
      resources: ['*']
    });

    //granting IAM permissions to role
    role.addToPolicy(policy);

// In this rule, you'll also use a couple of Substitution templates.
// Substitution templates are expressions that let you insert dynamic values from functions and message data.
const dynamoDbRule = new iotCore.CfnTopicRule(this, 'wx_data_ddb', {
  ruleName:'wx_data_ddb',
  topicRulePayload: {
    ruleDisabled: false,
      sql: `SELECT temperature, humidity, barometer,
              wind.velocity as wind_velocity,
              wind.bearing as wind_bearing,
            FROM 'device/+/data'`,
      awsIotSqlVersion: '2016-03-23',
      actions: [
          {
              dynamoDb : {
                  tableName:"wx_data",
                  hashKeyField:'sample_time', // dynamoDb table Partition Key
                  hashKeyValue:'${timestamp()}', // dynamoDb table Partition Key value
                  rangeKeyField:'device_id', // dynamoDb table Sort Key
                  rangeKeyValue:'${cast(topic(2) AS DECIMAL)}', // dynamoDb table Sort Key value
                  payloadField:'device_data', // adding column to dynamoDb table to record the data from the imaginary weather sensor devices
                  roleArn:role.roleArn // assigned role to topicRule to access dynamoDb
              },
          },
      ],
  },
});
  }
}
