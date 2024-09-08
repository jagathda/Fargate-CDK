import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from "aws-cdk-lib";
import { Vpc, SubnetType, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Cluster, ContainerImage, FargateTaskDefinition } from 'aws-cdk-lib/aws-ecs';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
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

    // Allow inbound traffic on port 80
    securityGroup.addIngressRule(cdk.aws_ec2.Peer.anyIpv4(), cdk.aws_ec2.Port.tcp(80), 'Allow HTTP traffic');

    // Create an ECS Cluster in the VPC
    const cluster = new Cluster(this, 'FargateCluster', {
      vpc,
      clusterName: 'FargateCluster',
    });

    // Create ECS task excution role
    const excutionRole = new Role(this, 'EcsTaskExcutionRole', {
      assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazoneECSTaskExecutionRolePpolicy'),
      ],
    });

    // Create a Fargate task definition
    const taskDefinition = new FargateTaskDefinition(this, 'FargateTaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
      executionRole: excutionRole,
    });

    // Add a container to the task definition
    taskDefinition.addContainer('nginxContainer', {
      image: ContainerImage.fromRegistry('nginx:latest'),
      portMappings: [{ containerPort: 80}],
    });

  }
}
