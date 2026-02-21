# Docker Setup for Murty Website

This repository includes Docker configuration for both local development and production deployment to container-based infrastructure like AWS ECS, Google Cloud Run, or Azure Container Instances.

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed (usually included with Docker Desktop)

### Local Development

Run the development environment with live file watching:

```bash
# Build and start the development container
docker-compose up dev

# Or run in detached mode
docker-compose up -d dev
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
# Build and start the production container
docker-compose up prod
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

## Deployment to ECS

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

Create a file `ecs-task-definition.json`:

```json
{
  "family": "murty-site",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "murty-site",
      "image": "<aws-account-id>.dkr.ecr.<region>.amazonaws.com/murty-site:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/murty-site",
          "awslogs-region": "<region>",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

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

## Deployment to Other Platforms

### Google Cloud Run

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/<project-id>/murty-site

# Deploy to Cloud Run
gcloud run deploy murty-site \
  --image gcr.io/<project-id>/murty-site \
  --platform managed \
  --port 8000 \
  --allow-unauthenticated
```

### Azure Container Instances

```bash
# Build and push to Azure Container Registry
az acr build --registry <registry-name> --image murty-site:latest .

# Deploy to ACI
az container create \
  --resource-group <resource-group> \
  --name murty-site \
  --image <registry-name>.azurecr.io/murty-site:latest \
  --dns-name-label murty-site \
  --ports 8000
```

### Docker Hub (for general use)

```bash
# Tag for Docker Hub
docker tag murty-site:latest <your-dockerhub-username>/murty-site:latest

# Push to Docker Hub
docker push <your-dockerhub-username>/murty-site:latest
```

## Environment Variables

The container uses the environment variables from `.env` file. In production:

1. Copy `config/.env.example` to `.env` and update values
2. For ECS, use task definition environment variables or AWS Secrets Manager
3. For Cloud Run, use `--set-env-vars` flag
4. For ACI, use `--environment-variables` flag

Example for ECS task definition:

```json
"environment": [
  {
    "name": "GOOGLE_ANALYTICS_SITE_CODE",
    "value": "G-XXXXXXXXXX"
  }
]
```

## Troubleshooting

### Container exits immediately

Check logs:
```bash
docker-compose logs dev
docker logs <container-id>
```

### Permission issues

Make sure Docker has permissions to access mounted volumes:
```bash
chmod -R 755 src content assets config
```

### Build failures

Clear Docker cache and rebuild:
```bash
docker-compose build --no-cache dev
```

### Port already in use

Change the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "8001:8000"  # Use port 8001 instead
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

## Performance Optimization

The Dockerfile uses multi-stage builds to:
- Minimize final image size (production image is ~144MB)
- Separate build dependencies from runtime dependencies
- Cache layers efficiently for faster builds

Production image includes only:
- Deno runtime (Alpine-based, minimal)
- Built static files in `/app/public`
- Self-contained file server for serving static content

## Support

For issues or questions about Docker setup, please open an issue in the repository.
