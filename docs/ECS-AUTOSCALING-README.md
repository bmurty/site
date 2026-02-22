# ECS Auto-Scaling Configuration Files

Configuration files for setting up auto-scaling for the murty-site ECS service.

## Files

**Infrastructure as Code:**
- `ecs-autoscaling.cloudformation.yaml` - CloudFormation template with CPU/memory scaling policies
- `ecs-autoscaling.tf` - Terraform configuration (alternative to CloudFormation)
- `ecs-autoscaling-config.example.json` - Example configuration reference

**Deployment:**
- `dev/deploy-autoscaling.sh` - Bash script for CloudFormation deployment
- `.github/workflows/deploy-ecs-autoscaling.yml` - GitHub Actions workflow

## Quick Start

### CloudFormation Script

```bash
export ECS_CLUSTER_NAME=your-cluster-name
./dev/deploy-autoscaling.sh
```

### Terraform

```bash
terraform init
terraform apply -var="ecs_cluster_name=your-cluster-name"
```

### GitHub Actions

1. Go to Actions → Deploy ECS Auto Scaling
2. Click "Run workflow"
3. Type `deploy` to confirm
4. Enter cluster name and parameters

## Scaling Defaults

- Min/Max Tasks: 1-10
- CPU Target: 70%
- Memory Target: 80%
- Scale Out Cooldown: 60s
- Scale In Cooldown: 300s

## Customization

Customize via:
- CloudFormation parameters
- Terraform variables
- Environment variables (deploy script)
- GitHub Actions workflow inputs

## More Information

- [ECS Auto-Scaling Documentation](ECS-AUTOSCALING.md)
- [Docker Documentation](DOCKER.md)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
