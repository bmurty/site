# ECS Auto Scaling Setup

This document describes how to configure auto-scaling for the murty-site ECS service.

## Overview

The auto-scaling configuration provides:

- **Target Tracking Scaling**: Automatically adjusts task count based on CPU and memory utilization
- **Step Scaling**: More granular scaling based on CPU thresholds
- **CloudWatch Alarms**: Monitors service health and triggers scaling actions
- **Configurable Limits**: Min/max task counts and scaling thresholds

## Auto Scaling Policies

### 1. CPU-Based Target Tracking (Default: 70%)
Maintains average CPU utilization around the target value by automatically scaling tasks.

### 2. Memory-Based Target Tracking (Default: 80%)
Maintains average memory utilization around the target value by automatically scaling tasks.

### 3. Step Scaling for CPU
Provides more aggressive scaling based on CPU thresholds:
- 85-95% CPU: Increase by 10%
- 95-105% CPU: Increase by 20%
- >105% CPU: Increase by 30%

## Default Configuration

| Parameter | Default Value | Description |
|-----------|---------------|-------------|
| Min Tasks | 1 | Minimum number of running tasks |
| Max Tasks | 10 | Maximum number of running tasks |
| Target CPU | 70% | Target CPU utilization for scaling |
| Target Memory | 80% | Target memory utilization for scaling |
| Scale Out Cooldown | 60s | Wait time after scaling out |
| Scale In Cooldown | 300s | Wait time after scaling in |
| High CPU Alarm | 85% | CPU threshold for step scaling |
| High Memory Alarm | 90% | Memory threshold for alerts |

## Deployment Options

Choose one of the following methods to deploy auto-scaling:

### Option 1: AWS CloudFormation (Recommended)

1. Review and customize parameters in `ecs-autoscaling.cloudformation.yaml`
2. Deploy the stack:

```bash
aws cloudformation create-stack \
  --stack-name murty-site-autoscaling \
  --template-body file://ecs-autoscaling.cloudformation.yaml \
  --parameters \
    ParameterKey=ECSClusterName,ParameterValue=your-cluster-name \
    ParameterKey=ECSServiceName,ParameterValue=murty-site-service \
    ParameterKey=MinTaskCount,ParameterValue=1 \
    ParameterKey=MaxTaskCount,ParameterValue=10 \
  --region us-east-1
```

3. Update an existing stack:

```bash
aws cloudformation update-stack \
  --stack-name murty-site-autoscaling \
  --template-body file://ecs-autoscaling.cloudformation.yaml \
  --parameters \
    ParameterKey=ECSClusterName,ParameterValue=your-cluster-name \
    ParameterKey=ECSServiceName,ParameterValue=murty-site-service \
  --region us-east-1
```

### Option 2: Terraform

1. Initialize Terraform:

```bash
terraform init
```

2. Review the plan:

```bash
terraform plan \
  -var="ecs_cluster_name=your-cluster-name" \
  -var="ecs_service_name=murty-site-service"
```

3. Apply the configuration:

```bash
terraform apply \
  -var="ecs_cluster_name=your-cluster-name" \
  -var="ecs_service_name=murty-site-service"
```

### Option 3: AWS CLI (Manual)

Use the configuration file as a reference and apply settings via AWS CLI:

1. Register the scaling target:

```bash
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/your-cluster/murty-site-service \
  --min-capacity 1 \
  --max-capacity 10
```

2. Create CPU scaling policy:

```bash
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/your-cluster/murty-site-service \
  --policy-name murty-site-cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://cpu-scaling-policy.json
```

Example `cpu-scaling-policy.json`:
```json
{
  "TargetValue": 70.0,
  "PredefinedMetricSpecification": {
    "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
  },
  "ScaleOutCooldown": 60,
  "ScaleInCooldown": 300
}
```

3. Create memory scaling policy:

```bash
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/your-cluster/murty-site-service \
  --policy-name murty-site-memory-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://memory-scaling-policy.json
```

Example `memory-scaling-policy.json`:
```json
{
  "TargetValue": 80.0,
  "PredefinedMetricSpecification": {
    "PredefinedMetricType": "ECSServiceAverageMemoryUtilization"
  },
  "ScaleOutCooldown": 60,
  "ScaleInCooldown": 300
}
```

## GitHub Actions Integration

Add auto-scaling deployment to your CI/CD workflow:

```yaml
- name: Deploy Auto Scaling Configuration
  run: |
    aws cloudformation deploy \
      --stack-name murty-site-autoscaling \
      --template-file ecs-autoscaling.cloudformation.yaml \
      --parameter-overrides \
        ECSClusterName=${{ secrets.ECS_CLUSTER_NAME }} \
        ECSServiceName=murty-site-service \
      --capabilities CAPABILITY_IAM \
      --region us-east-1
```

## Monitoring

### CloudWatch Metrics

Monitor these key metrics in CloudWatch:

- **CPUUtilization**: Average CPU usage across all tasks
- **MemoryUtilization**: Average memory usage across all tasks
- **DesiredTaskCount**: Number of tasks the service should run
- **RunningTaskCount**: Number of currently running tasks

### CloudWatch Alarms

The configuration creates these alarms:

1. **High CPU Alarm**: Triggers at 85% average CPU utilization
2. **High Memory Alarm**: Triggers at 90% average memory utilization

### Viewing Scaling Activities

```bash
# View scaling activities
aws application-autoscaling describe-scaling-activities \
  --service-namespace ecs \
  --resource-id service/your-cluster/murty-site-service

# View current scaling policies
aws application-autoscaling describe-scaling-policies \
  --service-namespace ecs \
  --resource-id service/your-cluster/murty-site-service
```

## Customization

### Adjusting Scaling Thresholds

Modify the parameters in the CloudFormation template or Terraform variables:

- **Increase CPU threshold** if tasks are scaling too aggressively
- **Decrease CPU threshold** if you want more responsive scaling
- **Adjust cooldown periods** to control how quickly the service can scale

### Task Count Limits

Set appropriate min/max values based on:
- Expected traffic patterns
- Budget constraints
- Service capacity requirements

### Step Scaling Adjustments

Modify the step scaling configuration to change how aggressively the service scales:

```yaml
StepAdjustments:
  - MetricIntervalLowerBound: 0
    MetricIntervalUpperBound: 10
    ScalingAdjustment: 10    # Change this percentage
```

## Testing Auto Scaling

### Load Testing

1. Generate load on your service:

```bash
# Example using Apache Bench
ab -n 10000 -c 100 https://your-service-url/
```

2. Monitor scaling in CloudWatch:
   - Go to ECS → Clusters → Your Cluster → Services → murty-site-service
   - Check the "Tasks" tab to see task count changes
   - View "Metrics" tab for CPU/Memory utilization

3. Verify scaling activities:

```bash
aws application-autoscaling describe-scaling-activities \
  --service-namespace ecs \
  --resource-id service/your-cluster/murty-site-service \
  --max-results 10
```

## Troubleshooting

### Tasks Not Scaling

1. **Check IAM permissions**: Ensure the Application Auto Scaling service role exists
2. **Verify metrics**: Confirm CloudWatch metrics are being published
3. **Review alarm state**: Check if CloudWatch alarms are in ALARM state
4. **Check cooldown periods**: Scaling might be delayed due to cooldown

### Scaling Too Aggressively

1. Increase cooldown periods
2. Raise the target utilization thresholds
3. Adjust step scaling boundaries

### Scaling Not Fast Enough

1. Decrease cooldown periods (especially scale-out)
2. Lower the target utilization thresholds
3. Make step scaling more aggressive

## Cost Optimization

- Set appropriate **max task count** to avoid unexpected costs
- Use **longer scale-in cooldown** to prevent thrashing
- Monitor CloudWatch costs (alarms and custom metrics)
- Consider using **Fargate Spot** for cost savings on non-critical tasks

## Security Considerations

- Review IAM roles and permissions
- Ensure CloudWatch Logs are configured for audit trail
- Set up SNS notifications for critical alarms
- Use AWS Config to track configuration changes

## References

- [AWS Application Auto Scaling Documentation](https://docs.aws.amazon.com/autoscaling/application/userguide/what-is-application-auto-scaling.html)
- [ECS Service Auto Scaling](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-auto-scaling.html)
- [Target Tracking Scaling Policies](https://docs.aws.amazon.com/autoscaling/application/userguide/application-auto-scaling-target-tracking.html)
- [Step Scaling Policies](https://docs.aws.amazon.com/autoscaling/application/userguide/application-auto-scaling-step-scaling-policies.html)
