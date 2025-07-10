#!/bin/bash

# deploy.sh - Automated deployment script for AWS ECS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed"
        exit 1
    fi
    
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed"
        exit 1
    fi
    
    print_status "All prerequisites are installed"
}

# Function to deploy infrastructure
deploy_infrastructure() {
    print_status "Deploying infrastructure with Terraform..."
    
    cd terraform
    
    if [ ! -f "terraform.tfvars" ]; then
        print_warning "terraform.tfvars not found. Creating template..."
        cat > terraform.tfvars << EOF
# Customize these values for your deployment
aws_region = "us-east-1"
project_name = "backend-app"
environment = "production"
container_port = 3000
desired_count = 2
cpu = 512
memory = 1024
# database_url = "postgresql://username:password@host:5432/database"
frontend_url = "https://your-frontend.com"
lambda_url = "https://your-lambda.com"
EOF
        print_warning "Please edit terraform/terraform.tfvars with your specific values before continuing"
        read -p "Press Enter after editing terraform.tfvars to continue..."
    fi
    
    terraform init
    terraform plan
    
    read -p "Do you want to apply this plan? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        terraform apply -auto-approve
        print_status "Infrastructure deployment completed"
    else
        print_error "Deployment cancelled"
        exit 1
    fi
    
    cd ..
}

# Function to build and push Docker image
build_and_push_image() {
    print_status "Building and pushing Docker image..."
    
    # Get ECR URL from Terraform output
    cd terraform
    ECR_URL=$(terraform output -raw ecr_repository_url)
    AWS_REGION=$(terraform output -raw aws_region)
    cd ..
    
    print_status "ECR Repository: $ECR_URL"
    
    # Build image
    print_status "Building Docker image..."
    docker build -t backend-app .
    docker tag backend-app:latest $ECR_URL:latest
    
    # Login to ECR
    print_status "Logging into ECR..."
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URL
    
    # Push image
    print_status "Pushing image to ECR..."
    docker push $ECR_URL:latest
    
    print_status "Image pushed successfully"
}

# Function to update ECS service
update_ecs_service() {
    print_status "Updating ECS service..."
    
    cd terraform
    CLUSTER_NAME=$(terraform output -raw ecs_cluster_name)
    SERVICE_NAME=$(terraform output -raw ecs_service_name)
    AWS_REGION=$(terraform output -raw aws_region)
    cd ..
    
    print_status "Forcing new deployment..."
    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service $SERVICE_NAME \
        --force-new-deployment \
        --region $AWS_REGION
    
    print_status "Waiting for service to stabilize..."
    aws ecs wait services-stable \
        --cluster $CLUSTER_NAME \
        --services $SERVICE_NAME \
        --region $AWS_REGION
    
    print_status "Service updated successfully"
}

# Function to show deployment information
show_deployment_info() {
    print_status "Deployment completed successfully!"
    
    cd terraform
    ALB_URL=$(terraform output -raw alb_url)
    ECR_URL=$(terraform output -raw ecr_repository_url)
    LOG_GROUP=$(terraform output -raw cloudwatch_log_group_name)
    cd ..
    
    echo ""
    echo "=== Deployment Information ==="
    echo "Application URL: $ALB_URL"
    echo "ECR Repository: $ECR_URL"
    echo "CloudWatch Logs: $LOG_GROUP"
    echo ""
    echo "Health Check: $ALB_URL/health"
    echo ""
    print_status "You can monitor your application at: $ALB_URL"
}

# Main deployment flow
main() {
    print_status "Starting automated deployment..."
    
    check_prerequisites
    deploy_infrastructure
    build_and_push_image
    update_ecs_service
    show_deployment_info
    
    print_status "Deployment completed successfully!"
}

# Handle script arguments
case "${1:-}" in
    "infrastructure")
        check_prerequisites
        deploy_infrastructure
        ;;
    "image")
        check_prerequisites
        build_and_push_image
        ;;
    "service")
        check_prerequisites
        update_ecs_service
        ;;
    "info")
        show_deployment_info
        ;;
    *)
        main
        ;;
esac
