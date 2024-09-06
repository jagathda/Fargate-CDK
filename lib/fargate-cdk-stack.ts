import * as cdk from 'aws-cdk-lib';
import { Vpc, SubnetType, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class FargateCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC with public subnets
    const vpc = new Vpc(this, 'FargateVPC', {
      maxAzs: 2,
      subnetConfiguration: [
        {
          name: 'PublicSubnet',
          subnetType: SubnetType.PUBLIC,
          cidrMask: 24,
        },
      ],
    });

    // Create a security group for the ECS service
    const securityGroup = new SecurityGroup(this, 'FargateSecurityGroup', {
      vpc,
      allowAllOutbound: true,
      securityGroupName: 'FargateSG',
    });

  }
}
