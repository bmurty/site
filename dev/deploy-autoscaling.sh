#!/bin/bash
# Helper script to deploy ECS auto-scaling configuration using CloudFormation

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
STACK_NAME="${STACK_NAME:-murty-site-autoscaling}"
TEMPLATE_FILE="${TEMPLATE_FILE:-ecs-autoscaling.cloudformation.yaml}"
AWS_REGION="${AWS_REGION:-us-east-1}"

# Required parameters
ECS_CLUSTER_NAME="${ECS_CLUSTER_NAME:-}"
ECS_SERVICE_NAME="${ECS_SERVICE_NAME:-murty-site-service}"

# Optional parameters with defaults
MIN_TASK_COUNT="${MIN_TASK_COUNT:-1}"
MAX_TASK_COUNT="${MAX_TASK_COUNT:-10}"
TARGET_CPU="${TARGET_CPU:-70}"
TARGET_MEMORY="${TARGET_MEMORY:-80}"
SCALE_OUT_COOLDOWN="${SCALE_OUT_COOLDOWN:-60}"
SCALE_IN_COOLDOWN="${SCALE_IN_COOLDOWN:-300}"

# Prompt for AWS credentials
echo -e "${YELLOW}AWS CLI Configuration${NC}"
echo "Please enter your AWS credentials:"
echo ""

read -p "AWS Access Key ID: " AWS_ACCESS_KEY_ID
read -p "AWS Secret Access Key: " -s AWS_SECRET_ACCESS_KEY
echo ""
read -p "AWS Region [${AWS_REGION}]: " AWS_REGION_INPUT
AWS_REGION="${AWS_REGION_INPUT:-$AWS_REGION}"

# Configure AWS CLI with provided credentials
export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY
export AWS_DEFAULT_REGION="${AWS_REGION}"

echo ""
echo -e "${GREEN}ECS Auto-Scaling Deployment Script${NC}"
echo "======================================"

# Check if ECS cluster name is provided
if [ -z "$ECS_CLUSTER_NAME" ]; then
    echo -e "${RED}Error: ECS_CLUSTER_NAME environment variable is required${NC}"
    echo ""
    echo "Usage:"
    echo "  export ECS_CLUSTER_NAME=your-cluster-name"
    echo "  export ECS_SERVICE_NAME=your-service-name  # Optional, defaults to murty-site-service"
    echo "  ./dev/deploy-autoscaling.sh"
    echo ""
    echo "Optional environment variables:"
    echo "  MIN_TASK_COUNT (default: 1)"
    echo "  MAX_TASK_COUNT (default: 10)"
    echo "  TARGET_CPU (default: 70)"
    echo "  TARGET_MEMORY (default: 80)"
    echo "  SCALE_OUT_COOLDOWN (default: 60)"
    echo "  SCALE_IN_COOLDOWN (default: 300)"
    echo "  AWS_REGION (default: us-east-1)"
    exit 1
fi

echo "Configuration:"
echo "  Stack Name: $STACK_NAME"
echo "  Cluster: $ECS_CLUSTER_NAME"
echo "  Service: $ECS_SERVICE_NAME"
echo "  Min Tasks: $MIN_TASK_COUNT"
echo "  Max Tasks: $MAX_TASK_COUNT"
echo "  Target CPU: ${TARGET_CPU}%"
echo "  Target Memory: ${TARGET_MEMORY}%"
echo "  Region: $AWS_REGION"
echo ""

# Validate template
echo -e "${YELLOW}Validating CloudFormation template...${NC}"
aws cloudformation validate-template \
    --template-body file://$TEMPLATE_FILE \
    --region $AWS_REGION > /dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Template validation successful${NC}"
else
    echo -e "${RED}✗ Template validation failed${NC}"
    exit 1
fi

# Check if stack exists
STACK_EXISTS=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $AWS_REGION \
    2>&1 || true)

if echo "$STACK_EXISTS" | grep -q "does not exist"; then
    echo -e "${YELLOW}Creating new stack...${NC}"
    OPERATION="create-stack"
else
    echo -e "${YELLOW}Updating existing stack...${NC}"
    OPERATION="update-stack"
fi

# Deploy stack
echo -e "${YELLOW}Deploying auto-scaling configuration...${NC}"
aws cloudformation deploy \
    --stack-name $STACK_NAME \
    --template-file $TEMPLATE_FILE \
    --parameter-overrides \
        ECSClusterName=$ECS_CLUSTER_NAME \
        ECSServiceName=$ECS_SERVICE_NAME \
        MinTaskCount=$MIN_TASK_COUNT \
        MaxTaskCount=$MAX_TASK_COUNT \
        TargetCPUUtilization=$TARGET_CPU \
        TargetMemoryUtilization=$TARGET_MEMORY \
        ScaleOutCooldown=$SCALE_OUT_COOLDOWN \
        ScaleInCooldown=$SCALE_IN_COOLDOWN \
    --capabilities CAPABILITY_IAM \
    --region $AWS_REGION

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Stack deployment successful${NC}"
else
    echo -e "${RED}✗ Stack deployment failed${NC}"
    exit 1
fi

# Display stack outputs
echo ""
echo -e "${YELLOW}Stack Outputs:${NC}"
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $AWS_REGION \
    --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
    --output table

# Verify scaling policies
echo ""
echo -e "${YELLOW}Verifying scaling policies...${NC}"
aws application-autoscaling describe-scaling-policies \
    --service-namespace ecs \
    --resource-id service/$ECS_CLUSTER_NAME/$ECS_SERVICE_NAME \
    --region $AWS_REGION \
    --query 'ScalingPolicies[*].[PolicyName,PolicyType]' \
    --output table

echo ""
echo -e "${GREEN}✓ Auto-scaling deployment complete!${NC}"
echo ""
echo "Monitor your service at:"
echo "  https://console.aws.amazon.com/ecs/home?region=$AWS_REGION#/clusters/$ECS_CLUSTER_NAME/services/$ECS_SERVICE_NAME"
