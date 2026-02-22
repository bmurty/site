# ECS Auto-Scaling Configuration Files

This directory contains configuration files for setting up auto-scaling for the murty-site ECS service.

## Available Files

### Infrastructure as Code

1. **ecs-autoscaling.cloudformation.yaml**
   - AWS CloudFormation template for auto-scaling setup
   - Includes CPU and memory-based scaling policies
   - Configurable parameters for min/max tasks, thresholds, and cooldowns
   - Recommended for AWS-native deployments

2. **ecs-autoscaling.tf**
   - Terraform configuration for auto-scaling setup
   - Same features as CloudFormation template
   - Use if you prefer Terraform for infrastructure management

### Configuration Files

3. **ecs-autoscaling-config.example.json**
   - Example configuration file showing all available settings
   - Reference for manual CLI-based deployment
   - Documents default values and scaling behavior

### Deployment Scripts

4. **dev/deploy-autoscaling.sh**
   - Bash script for easy CloudFormation deployment
   - Validates template before deployment
   - Displays stack outputs and verification
   - Usage: `export ECS_CLUSTER_NAME=your-cluster && ./dev/deploy-autoscaling.sh`

### GitHub Actions Workflow

5. **.github/workflows/deploy-ecs-autoscaling.yml**
   - Automated deployment via GitHub Actions
   - Manual workflow dispatch with input parameters
   - Validates and deploys CloudFormation stack
   - Verifies scaling policies after deployment

## Quick Start

### Option 1: CloudFormation (Recommended)

```bash
# Set your cluster name
export ECS_CLUSTER_NAME=your-cluster-name

# Deploy using the helper script
./dev/deploy-autoscaling.sh
```

### Option 2: Terraform

```bash
# Initialize Terraform
terraform init

# Deploy
terraform apply -var="ecs_cluster_name=your-cluster-name"
```

### Option 3: GitHub Actions

1. Go to Actions → Deploy ECS Auto Scaling
2. Click "Run workflow"
3. Enter your cluster name and other parameters
4. Click "Run workflow"

## Documentation

For detailed setup instructions, see [docs/ECS-AUTOSCALING.md](docs/ECS-AUTOSCALING.md)

## Default Scaling Behavior

- **Min Tasks**: 1
- **Max Tasks**: 10
- **CPU Target**: 70% utilization
- **Memory Target**: 80% utilization
- **Scale Out Cooldown**: 60 seconds
- **Scale In Cooldown**: 300 seconds

## Customization

All values can be customized through:
- CloudFormation parameters
- Terraform variables
- Environment variables (when using deploy script)
- GitHub Actions workflow inputs

## Monitoring

After deployment, monitor your service in:
- AWS Console → ECS → Your Cluster → Your Service
- CloudWatch → Alarms (for high CPU/memory alerts)
- CloudWatch → Metrics → ECS (for service metrics)

## Support

For issues or questions, refer to:
- [ECS Auto-Scaling Documentation](docs/ECS-AUTOSCALING.md)
- [Docker Documentation](docs/DOCKER.md)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
