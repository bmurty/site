# Docker Setup for Murty Website

This repository includes Docker configuration for both local development and production deployment to AWS ECS, acontainer-based infrastructure system.

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed (usually included with Docker Desktop)

### Local Development

Run the development environment with live file watching:

```bash
deno task docker-dev
```

Access the site at [http://localhost:8000](http://localhost:8000)

The development container:

- Mounts your source code for live editing
- Rebuilds the site when started
- Serves the static site on port 8000
- Persists Deno cache for faster rebuilds

### Production Build

Test the production build locally:

```bash
deno task docker-prod
```

Access the site at [http://localhost:8080](http://localhost:8080)

## Docker Commands

### Build Images

```bash
# Build development image
docker build --target development -t murty-site:dev .

# Build production image
docker build --target production -t murty-site:prod .
```

### Run Containers

```bash
# Run development container
docker run -p 8000:8000 -v $(pwd):/app murty-site:dev

# Run production container
docker run -p 8000:8000 murty-site:prod
```

### Execute Commands in Container

```bash
# Run tests
docker-compose run dev deno task test

# Lint code
docker-compose run dev deno task lint

# Build site manually
docker-compose run dev deno task build

# Access shell
docker-compose run dev sh
```

## Deployment to AWS ECS

### 1. Build and Tag for ECR

```bash
# Build production image
docker build --target production -t murty-site:latest .

# Tag for ECR (replace with your AWS account ID and region)
docker tag murty-site:latest <aws-account-id>.dkr.ecr.<region>.amazonaws.com/murty-site:latest
```

### 2. Push to ECR

```bash
# Login to ECR
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <aws-account-id>.dkr.ecr.<region>.amazonaws.com

# Create ECR repository (first time only)
aws ecr create-repository --repository-name murty-site --region <region>

# Push image
docker push <aws-account-id>.dkr.ecr.<region>.amazonaws.com/murty-site:latest
```

### 3. Create ECS Task Definition

Create a copy of the sample ECS Task Definitions file:

```bash
cp --update=none "config/ecs-task-definition.example.json" "ecs-task-definition.json"
```

Fill out your AWS credentials in the new Git Ignored file at `/ecs-task-definition.json`

### 4. Register Task Definition

```bash
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
```

### 5. Create/Update ECS Service

```bash
# Create service (first time)
aws ecs create-service \
  --cluster <your-cluster-name> \
  --service-name murty-site \
  --task-definition murty-site \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[<subnet-id>],securityGroups=[<security-group-id>],assignPublicIp=ENABLED}"

# Update service (for deployments)
aws ecs update-service \
  --cluster <your-cluster-name> \
  --service murty-site \
  --force-new-deployment
```

## Environment Variables

The container uses the environment variables from `.env` file. In production:

1. Copy `config/.env.example` to `.env` and update values
2. For ECS, use task definition environment variables or AWS Secrets Manager

Example for ECS task definition:

```json
"environment": [
  {
    "name": "GOOGLE_ANALYTICS_SITE_CODE",
    "value": "G-XXXXXXXXXX"
  }
]
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Deploy to ECS
on:
  push:
    tags:
      - '[0-9]*'
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      - name: Build and push image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: murty-site
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build --target production -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster <cluster> --service murty-site --force-new-deployment
```
