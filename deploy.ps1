# deploy.ps1 - PowerShell deployment script for AWS ECS

param(
    [string]$Action = "full"
)

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if required tools are installed
function Test-Prerequisites {
    Write-Status "Checking prerequisites..."
    
    if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not installed"
        exit 1
    }
    
    if (!(Get-Command aws -ErrorAction SilentlyContinue)) {
        Write-Error "AWS CLI is not installed"
        exit 1
    }
    
    if (!(Get-Command terraform -ErrorAction SilentlyContinue)) {
        Write-Error "Terraform is not installed"
        exit 1
    }
    
    Write-Status "All prerequisites are installed"
}

# Function to deploy infrastructure
function Deploy-Infrastructure {
    Write-Status "Deploying infrastructure with Terraform..."
    
    Set-Location terraform
    
    if (!(Test-Path "terraform.tfvars")) {
        Write-Warning "terraform.tfvars not found. Creating template..."
        
        $tfvarsContent = @"
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
"@
        
        $tfvarsContent | Out-File -FilePath "terraform.tfvars" -Encoding UTF8
        Write-Warning "Please edit terraform/terraform.tfvars with your specific values before continuing"
        Read-Host "Press Enter after editing terraform.tfvars to continue"
    }
    
    terraform init
    terraform plan
    
    $response = Read-Host "Do you want to apply this plan? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        terraform apply -auto-approve
        Write-Status "Infrastructure deployment completed"
    } else {
        Write-Error "Deployment cancelled"
        exit 1
    }
    
    Set-Location ..
}

# Function to build and push Docker image
function Build-AndPushImage {
    Write-Status "Building and pushing Docker image..."
    
    # Get ECR URL from Terraform output
    Set-Location terraform
    $ECR_URL = terraform output -raw ecr_repository_url
    $AWS_REGION = terraform output -raw aws_region
    Set-Location ..
    
    Write-Status "ECR Repository: $ECR_URL"
    
    # Build image
    Write-Status "Building Docker image..."
    docker build -t backend-app .
    docker tag backend-app:latest "$ECR_URL:latest"
    
    # Login to ECR
    Write-Status "Logging into ECR..."
    $loginCommand = aws ecr get-login-password --region $AWS_REGION
    $loginCommand | docker login --username AWS --password-stdin $ECR_URL
    
    # Push image
    Write-Status "Pushing image to ECR..."
    docker push "$ECR_URL:latest"
    
    Write-Status "Image pushed successfully"
}

# Function to update ECS service
function Update-EcsService {
    Write-Status "Updating ECS service..."
    
    Set-Location terraform
    $CLUSTER_NAME = terraform output -raw ecs_cluster_name
    $SERVICE_NAME = terraform output -raw ecs_service_name
    $AWS_REGION = terraform output -raw aws_region
    Set-Location ..
    
    Write-Status "Forcing new deployment..."
    aws ecs update-service `
        --cluster $CLUSTER_NAME `
        --service $SERVICE_NAME `
        --force-new-deployment `
        --region $AWS_REGION
    
    Write-Status "Waiting for service to stabilize..."
    aws ecs wait services-stable `
        --cluster $CLUSTER_NAME `
        --services $SERVICE_NAME `
        --region $AWS_REGION
    
    Write-Status "Service updated successfully"
}

# Function to show deployment information
function Show-DeploymentInfo {
    Write-Status "Deployment completed successfully!"
    
    Set-Location terraform
    $ALB_URL = terraform output -raw alb_url
    $ECR_URL = terraform output -raw ecr_repository_url
    $LOG_GROUP = terraform output -raw cloudwatch_log_group_name
    Set-Location ..
    
    Write-Host ""
    Write-Host "=== Deployment Information ===" -ForegroundColor Cyan
    Write-Host "Application URL: $ALB_URL"
    Write-Host "ECR Repository: $ECR_URL"
    Write-Host "CloudWatch Logs: $LOG_GROUP"
    Write-Host ""
    Write-Host "Health Check: $ALB_URL/health"
    Write-Host ""
    Write-Status "You can monitor your application at: $ALB_URL"
}

# Main deployment flow
function Start-Deployment {
    Write-Status "Starting automated deployment..."
    
    Test-Prerequisites
    Deploy-Infrastructure
    Build-AndPushImage
    Update-EcsService
    Show-DeploymentInfo
    
    Write-Status "Deployment completed successfully!"
}

# Handle script arguments
switch ($Action) {
    "infrastructure" {
        Test-Prerequisites
        Deploy-Infrastructure
    }
    "image" {
        Test-Prerequisites
        Build-AndPushImage
    }
    "service" {
        Test-Prerequisites
        Update-EcsService
    }
    "info" {
        Show-DeploymentInfo
    }
    default {
        Start-Deployment
    }
}
