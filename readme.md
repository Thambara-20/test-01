# Backend Application - AWS ECS Deployment

This project is a TypeScript/Node.js Express application with TypeORM, PostgreSQL, and Socket.IO support, designed for deployment on AWS ECS Fargate.

## Prerequisites

- **Docker** installed on your local machine
- **AWS CLI** configured with appropriate permissions
- **Terraform** (>= 1.0) installed
- **Node.js** (>= 18) for local development

## Quick Start Deployment

### Step 0: Configure Environment Variables (Required)

Before building the Docker image, you need to configure your environment variables:

1. **Update the `.env` file with your database connection:**
   ```bash
   # Edit .env file with your actual database URL
   PG_DATABASE_URL=postgresql://username:password@host:port/database
   PORT=3000
   NODE_TLS_REJECT_UNAUTHORIZED=0
   ```

   **Important**: The `.env` file contains your database credentials and will be copied into the Docker image. For production, use environment variables or secrets management instead.

### Step 1: Build and Push Docker Image

1. **Build the Docker image locally:**
   ```bash
   docker build -t backend-app .
   ```

2. **Get AWS account ID and login to ECR:**
   ```bash
   aws sts get-caller-identity
   ```

3. **Create ECR repository and push image (after Terraform apply):**
   ```bash
   # Get ECR login token
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

   # Tag your image
   docker tag backend-app:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/backend-app:latest

   # Push the image
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/backend-app:latest
   ```

### Step 2: Deploy Infrastructure with Terraform

1. **Navigate to the terraform directory:**
   ```bash
   cd terraform
   ```

2. **Initialize Terraform:**
   ```bash
   terraform init
   ```

3. **Create a terraform.tfvars file (optional):**
   ```bash
   # Copy and customize variables
   cat > terraform.tfvars << EOF
   aws_region = "us-east-1"
   project_name = "backend-app"
   environment = "production"
   container_port = 3000
   desired_count = 2
   cpu = 512
   memory = 1024
   database_url = "postgresql://username:password@host:5432/database"
   frontend_url = "https://your-frontend.com"
   lambda_url = "https://your-lambda.com"
   EOF
   ```

4. **Plan the deployment:**
   ```bash
   terraform plan
   ```

5. **Apply the infrastructure:**
   ```bash
   terraform apply
   ```

6. **Note the outputs:**
   After successful deployment, Terraform will output important information including:
   - `alb_url`: The Application Load Balancer URL
   - `ecr_repository_url`: ECR repository URL for pushing images
   - `ecs_cluster_name`: ECS cluster name
   - `ecs_service_name`: ECS service name

### Step 3: Deploy Application

1. **Push your Docker image to ECR (using the ECR URL from Terraform output):**
   ```bash
   # Get ECR repository URL from Terraform output
   ECR_URL=$(terraform output -raw ecr_repository_url)
   
   # Build and tag image
   docker build -t backend-app .
   docker tag backend-app:latest $ECR_URL:latest
   
   # Login to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_URL
   
   # Push image
   docker push $ECR_URL:latest
   ```

2. **Force ECS service to redeploy with new image:**
   ```bash
   aws ecs update-service \
     --cluster $(terraform output -raw ecs_cluster_name) \
     --service $(terraform output -raw ecs_service_name) \
     --force-new-deployment
   ```

3. **Access your application:**
   ```bash
   echo "Application URL: $(terraform output -raw alb_url)"
   ```

## Environment Variables

The application requires the following environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Application port | Yes (default: 3000) |
| `NODE_ENV` | Environment mode | Yes (default: production) |
| `PG_DATABASE_URL` | PostgreSQL connection string | Yes |
| `FRONT_END_URL` | Frontend URL for CORS | Yes |
| `LAMBDA_URL` | Lambda URL for CORS | Yes |

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your local settings
   ```

3. **Run in development mode:**
   ```bash
   npm start
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm run serve
   ```

## Testing

Run the test suite:
```bash
npm test
```

## Monitoring and Logs

- **CloudWatch Logs:** Navigate to AWS CloudWatch > Log groups > `/ecs/backend-app`
- **ECS Service Health:** Check the ECS console for service and task status
- **Application Load Balancer:** Monitor ALB target group health in the EC2 console

## Health Check

The application exposes a health check endpoint at `/health` that returns:
```json
{
  "status": "ok",
  "timestamp": "2025-07-10T12:00:00.000Z"
}
```

## Infrastructure Components

This deployment creates:

- **VPC** with public subnets across 2 AZs
- **Application Load Balancer** for traffic distribution
- **ECS Fargate Cluster** for container orchestration
- **ECR Repository** for Docker image storage
- **CloudWatch Log Group** for application logs
- **IAM Roles** with minimal required permissions
- **Security Groups** with least-privilege access
- **SSM Parameter Store** for secure environment variables

## Scaling

To scale the application:

1. **Update desired count in terraform/variables.tf:**
   ```hcl
   variable "desired_count" {
     default = 4  # Increase from 2 to 4
   }
   ```

2. **Apply changes:**
   ```bash
   terraform apply
   ```

## Cleanup

To destroy all resources:
```bash
cd terraform
terraform destroy
```

**⚠️ Warning:** This will delete all AWS resources including data stored in any databases.

## Troubleshooting

### Common Issues:

1. **ECS Tasks failing to start:**
   - Check CloudWatch logs for application errors
   - Verify environment variables are correctly set
   - Ensure Docker image exists in ECR

2. **ALB health checks failing:**
   - Verify the `/health` endpoint is working locally
   - Check security group rules allow ALB to reach ECS tasks
   - Confirm container port matches ALB target group port

3. **Database connection issues:**
   - Verify database URL is correctly formatted
   - Check network connectivity from ECS tasks to database
   - Ensure database allows connections from ECS security group

### Useful AWS CLI Commands:

```bash
# Check ECS service status
aws ecs describe-services --cluster backend-app-cluster --services backend-app-service

# View ECS task logs
aws logs tail /ecs/backend-app --follow

# Check ALB target health
aws elbv2 describe-target-health --target-group-arn <target-group-arn>
```

## Security Considerations

- All containers run as non-root users
- Security groups follow least-privilege principle
- Sensitive data stored in AWS SSM Parameter Store
- ECR image scanning enabled
- VPC provides network isolation
- IAM roles use minimal required permissions

## Cost Optimization

- Uses Fargate SPOT for cost savings (can be enabled)
- ECR lifecycle policy removes old images
- CloudWatch log retention set to 30 days
- Right-sized CPU/memory allocation

For production workloads, consider:
- Reserved capacity for predictable workloads
- Auto-scaling based on CPU/memory metrics
- Multi-region deployment for high availability

## 🎉 **Deployment Status: READY FOR PRODUCTION!**

### ✅ **What's Working:**
- ✅ Docker container builds successfully
- ✅ Application connects to database (PostgreSQL on Aiven Cloud)
- ✅ Health endpoint responds correctly (`/health`)
- ✅ All API routes are available and functional
- ✅ TypeScript compilation and file structure resolved
- ✅ Environment variables loaded from `.env` file
- ✅ Production-ready with proper error handling
- ✅ Complete AWS ECS Fargate infrastructure ready

### 🚀 **Production Deployment Commands:**

```powershell
# Quick deployment (all steps)
.\deploy.ps1

# Or step by step:
.\deploy.ps1 infrastructure  # Deploy AWS infrastructure
.\deploy.ps1 image          # Build and push Docker image  
.\deploy.ps1 service        # Update ECS service
.\deploy.ps1 info           # Show deployment info
```
