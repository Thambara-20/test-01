# variables.tf
variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "backend-app"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "container_port" {
  description = "Port that the container exposes"
  type        = number
  default     = 3000
}

variable "desired_count" {
  description = "Number of ECS service instances"
  type        = number
  default     = 2
}

variable "cpu" {
  description = "CPU units for the ECS task (1 vCPU = 1024 units)"
  type        = number
  default     = 512
}

variable "memory" {
  description = "Memory in MiB for the ECS task"
  type        = number
  default     = 1024
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "database_url" {
  description = "PostgreSQL database URL"
  type        = string
  sensitive   = true
}

variable "frontend_url" {
  description = "Frontend URL for CORS"
  type        = string
  default     = "https://your-frontend-domain.com"
}

variable "lambda_url" {
  description = "Lambda URL for CORS"
  type        = string
  default     = "https://your-lambda-domain.com"
}

# variables.tf
variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "backend-app"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "container_port" {
  description = "Port that the container exposes"
  type        = number
  default     = 3000
}

variable "desired_count" {
  description = "Number of ECS service instances"
  type        = number
  default     = 2
}

variable "cpu" {
  description = "CPU units for the ECS task (1 vCPU = 1024 units)"
  type        = number
  default     = 512
}

variable "memory" {
  description = "Memory in MiB for the ECS task"
  type        = number
  default     = 1024
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "database_url" {
  description = "PostgreSQL database URL"
  type        = string
  sensitive   = true
  default     = ""
}

variable "frontend_url" {
  description = "Frontend URL for CORS"
  type        = string
  default     = "https://your-frontend-domain.com"
}

variable "lambda_url" {
  description = "Lambda URL for CORS"
  type        = string
  default     = "https://your-lambda-domain.com"
}
