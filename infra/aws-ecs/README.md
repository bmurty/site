# AWS ECS Deployment

Deploy the murty-site to AWS ECS with auto-scaling using the files in this directory.

## Files

**Infrastructure as Code:**
- `ecs-autoscaling.cloudformation.yaml` - CloudFormation template with CPU/memory scaling policies
- `ecs-autoscaling.tf` - Terraform configuration (alternative to CloudFormation)
- `ecs-autoscaling-config.example.json` - Example configuration reference
- `ecs-task-definition.example.json` - Example ECS task definition

**Deployment:**
- `deploy.sh` - Bash script for CloudFormation deployment
- `.github/workflows/deploy-aws.yml` - GitHub Actions workflow

## Deployment

### Bash Script (Recommended)

```bash
export ECS_CLUSTER_NAME=your-cluster-name
bash ./infra/aws-ecs/deploy-aws.sh
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

1. Go to **Actions** → **Deploy to AWS**
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
  --template-file infra/aws-ecs/ecs-autoscaling.cloudformation.yaml \
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

## ECS Task Definition

Create a copy of the example task definition and fill in your AWS credentials:

```bash
cp --update=none "infra/aws-ecs/ecs-task-definition.example.json" "infra/aws-ecs/ecs-task-definition.json"
```

Then register it with AWS:

```bash
aws ecs register-task-definition --cli-input-json file://infra/aws-ecs/ecs-task-definition.json
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

**CloudFormation:** Edit parameters in `ecs-autoscaling.cloudformation.yaml`
**Terraform:** Set variables in `ecs-autoscaling.tf`
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
- Verify AWS credentials and IAM permissions
- Check the cluster and service exist
- Confirm the CloudFormation template is valid

**Tasks not scaling:**
- Check CloudWatch metrics and alarm states
- Review cooldown periods

## Reference

- [AWS ECS Auto Scaling](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-auto-scaling.html)
- [CloudFormation Docs](https://docs.aws.amazon.com/cloudformation/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
