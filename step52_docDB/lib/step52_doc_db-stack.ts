import * as cdk from '@aws-cdk/core';
import * as docdb from "@aws-cdk/aws-docdb";
import * as ec2 from "@aws-cdk/aws-ec2";
import { config } from "dotenv";
config();

export class Step52DocDbStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here
        const vpcCidr = "10.0.0.0/21";
        const port = 27017;

        const vpc = new ec2.Vpc(this, "vpc", {
            cidr: vpcCidr,
            subnetConfiguration: [
                {
                    subnetType: ec2.SubnetType.PRIVATE,
                    cidrMask: 24,
                    name: "PrivateSubnet2"
                },
                {
                    subnetType: ec2.SubnetType.PRIVATE,
                    cidrMask: 24,
                    name: "PrivateSubnet1"
                },
                {
                    subnetType: ec2.SubnetType.PUBLIC,
                    cidrMask: 28,
                    name: "PublicSubnet1"
                }
            ]
        });

        const sg = new ec2.SecurityGroup(this, "docdblambdasg", {
            vpc,
            securityGroupName: "docdblambdasg"
        });

        const subnetGroup = new docdb.CfnDBSubnetGroup(this, "subnetgroup", {
            subnetIds: vpc.privateSubnets.map(x => x.subnetId),
            dbSubnetGroupName: "subnetgroup",
            dbSubnetGroupDescription: "Subnet Group for DocDB"
        });

        const dbCluster = new docdb.CfnDBCluster(this, "dbcluster", {
            storageEncrypted: true,
            availabilityZones: vpc.availabilityZones.splice(3),
            dbClusterIdentifier: "docdb",
            masterUsername: "mkkdbuser",
            masterUserPassword: process.env.MASTER_USER_PASSWORD as string,
            vpcSecurityGroupIds: [sg.securityGroupName],
            dbSubnetGroupName: subnetGroup.dbSubnetGroupName,
            port
        });
        dbCluster.addDependsOn(subnetGroup);
        const dbInstance = new docdb.CfnDBInstance(this, "db-instance", {
            dbClusterIdentifier: dbCluster.ref,
            autoMinorVersionUpgrade: true,
            dbInstanceClass: "db.r5.large",
            dbInstanceIdentifier: "staging",
        });
        dbInstance.addDependsOn(dbCluster);
        sg.addIngressRule(ec2.Peer.ipv4(vpcCidr), ec2.Port.tcp(port));

        const DB_URL = `mongodb://${dbCluster.masterUsername}:${dbCluster.masterUserPassword}@${dbCluster.attrEndpoint}:${dbCluster.attrPort}`
        new cdk.CfnOutput(this, "db-url", {
            value: DB_URL
        });

    }
}