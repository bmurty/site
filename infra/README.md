# ECS Auto Scaling Setup

Deploy auto-scaling for the murty-site ECS service using the files in this repository.

## Files Added

- `infra/ecs-autoscaling.cloudformation.yaml` - CloudFormation template
- `infra/ecs-autoscaling.tf` - Terraform configuration
- `infra/ecs-autoscaling-config.example.json` - Example configuration
- `infra/deploy-aws.sh` - Deployment script
- `.github/workflows/deploy-ecs-autoscaling.yml` - GitHub Actions workflow

## Deployment

### Bash Script (Recommended)

```bash
export ECS_CLUSTER_NAME=your-cluster-name
./infra/deploy-aws.sh
```

Prompts for AWS credentials, validates template, and deploys the stack.

**Environment Variables:**
- `ECS_CLUSTER_NAME` (required) - ECS cluster name
- `ECS_SERVICE_NAME` (optional) - Defaults to `murty-site-service`
- `MIN_TASK_COUNT` (optional) - Defaults to `1`
- `MAX_TASK_COUNT` (optional) - Defaults to `10`
- `TARGET_CPU` (optional) - Defaults to `70`
- `TARGET_MEMORY` (optional) - Defaults to `80`

### GitHub Actions

1. Go to **Actions** → **Deploy ECS Auto Scaling**
2. Click **Run workflow**
3. Enter `deploy` to confirm
4. Provide cluster name and parameters

**Inputs:**
- `confirm` (required) - Type "deploy"
- `ecs_cluster_name` (required)
- `ecs_service_name` (optional) - Defaults to `murty-site-service`
- `min_task_count` (optional) - Defaults to `1`
- `max_task_count` (optional) - Defaults to `3`
- `aws_region` (optional) - Defaults to `ap-southeast-2`

### CloudFormation CLI

```bash
aws cloudformation deploy \
  --stack-name murty-site-autoscaling \
  --template-file infra/ecs-autoscaling.cloudformation.yaml \
  --parameter-overrides \
    ECSClusterName=your-cluster-name \
    ECSServiceName=murty-site-service \
  --region ap-southeast-2
```

### Terraform

```bash
terraform init
terraform apply -var="ecs_cluster_name=your-cluster-name"
```

## Scaling Configuration

**Policies:**
- CPU target tracking: 70%
- Memory target tracking: 80%
- Step scaling for CPU spikes

**Alarms:**
- High CPU: 85%
- High Memory: 90%

**Limits:**
- Min tasks: 1
- Max tasks: 10 (3 in GitHub Actions)

**Cooldowns:**
- Scale out: 60s
- Scale in: 300s

## Verification

```bash
# View scaling policies
aws application-autoscaling describe-scaling-policies \
  --service-namespace ecs \
  --resource-id service/your-cluster/murty-site-service

# View stack outputs
aws cloudformation describe-stacks \
  --stack-name murty-site-autoscaling \
  --query 'Stacks[0].Outputs'
```

## Customization

**CloudFormation:** Edit parameters in `infra/ecs-autoscaling.cloudformation.yaml`
**Terraform:** Set variables in `infra/ecs-autoscaling.tf`
**Bash script:** Set environment variables
**GitHub Actions:** Provide custom inputs

## Monitoring

**AWS Console:**
- ECS → Cluster → Service → Tasks
- CloudWatch → Alarms
- CloudWatch → Metrics → ECS

**CLI:**
```bash
aws application-autoscaling describe-scaling-activities \
  --service-namespace ecs \
  --resource-id service/your-cluster/murty-site-service \
  --max-results 10
```

## Troubleshooting

**Deployment fails:**
- Verify AWS credentials
- Check cluster/service exists
- Ensure IAM permissions

**Tasks not scaling:**
- Check CloudWatch metrics
- Verify alarm states
- Review cooldown periods

**Script validation fails:**
- Install AWS CLI
- Check template file exists
- Verify network connectivity

## Reference

- [AWS ECS Auto Scaling](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-auto-scaling.html)
- [CloudFormation Docs](https://docs.aws.amazon.com/cloudformation/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
