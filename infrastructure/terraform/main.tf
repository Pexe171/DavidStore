terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

locals {
  project_name = var.project_name
  common_tags  = merge(var.default_tags, {
    Project     = var.project_name
    Environment = var.environment
  })
}

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  tags                 = merge(local.common_tags, { Name = "${local.project_name}-vpc" })
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.main.id
  tags   = merge(local.common_tags, { Name = "${local.project_name}-igw" })
}

resource "aws_subnet" "public" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.public_subnet_cidr
  availability_zone = var.public_subnet_az
  map_public_ip_on_launch = true
  tags = merge(local.common_tags, { Name = "${local.project_name}-public" })
}

resource "aws_subnet" "private" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidr
  availability_zone = var.private_subnet_az
  tags              = merge(local.common_tags, { Name = "${local.project_name}-private" })
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  tags   = merge(local.common_tags, { Name = "${local.project_name}-public-rt" })
}

resource "aws_route" "public_internet" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.this.id
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "backend" {
  name        = "${local.project_name}-backend-sg"
  description = "Permite acesso HTTP/HTTPS e comunicação com banco e cache"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = var.allowed_http_cidrs
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = var.allowed_http_cidrs
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, { Name = "${local.project_name}-backend" })
}

resource "aws_security_group" "database" {
  name        = "${local.project_name}-db-sg"
  description = "Permite acesso ao PostgreSQL a partir do backend"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "PostgreSQL"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    security_groups = [aws_security_group.backend.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, { Name = "${local.project_name}-database" })
}

resource "aws_security_group" "redis" {
  name        = "${local.project_name}-redis-sg"
  description = "Permite acesso ao Redis apenas pelo backend"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Redis"
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    security_groups = [aws_security_group.backend.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, { Name = "${local.project_name}-redis" })
}

resource "aws_instance" "backend" {
  ami                    = var.backend_ami
  instance_type          = var.backend_instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.backend.id]
  key_name               = var.ssh_key_name

  user_data = templatefile("${path.module}/templates/backend-user-data.sh", {
    docker_image         = var.backend_docker_image
    environment          = var.environment
    redis_host           = aws_elasticache_replication_group.redis.primary_endpoint_address
    database_url         = "postgresql://${var.postgres_username}:${var.postgres_password}@${aws_db_instance.postgres.address}:${aws_db_instance.postgres.port}/${var.postgres_database}?schema=public"
    sqs_queue_url        = aws_sqs_queue.events.id
    aws_region           = var.aws_region
  })

  tags = merge(local.common_tags, { Name = "${local.project_name}-backend" })
}

resource "aws_db_subnet_group" "postgres" {
  name       = "${local.project_name}-db-subnet"
  subnet_ids = [aws_subnet.private.id]
  tags       = merge(local.common_tags, { Name = "${local.project_name}-db-subnet" })
}

resource "aws_db_instance" "postgres" {
  identifier              = "${var.project_name}-postgres"
  engine                  = "postgres"
  engine_version          = var.postgres_version
  instance_class          = var.postgres_instance_class
  username                = var.postgres_username
  password                = var.postgres_password
  allocated_storage       = var.postgres_allocated_storage
  max_allocated_storage   = var.postgres_max_allocated_storage
  publicly_accessible     = false
  skip_final_snapshot     = true
  storage_encrypted       = true
  db_subnet_group_name    = aws_db_subnet_group.postgres.name
  vpc_security_group_ids  = [aws_security_group.database.id]
  multi_az                = var.postgres_multi_az
  backup_retention_period = var.postgres_backup_retention_days
  tags                    = merge(local.common_tags, { Name = "${local.project_name}-postgres" })
}

resource "aws_elasticache_subnet_group" "redis" {
  name       = "${local.project_name}-redis-subnet"
  subnet_ids = [aws_subnet.private.id]
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id          = "${var.project_name}-redis"
  replication_group_description = "Redis para cache e rate limiting do ${var.project_name}"
  engine                        = "redis"
  engine_version                = var.redis_version
  node_type                     = var.redis_node_type
  number_cache_clusters         = 1
  automatic_failover_enabled    = false
  transit_encryption_enabled    = true
  at_rest_encryption_enabled    = true
  subnet_group_name             = aws_elasticache_subnet_group.redis.name
  security_group_ids            = [aws_security_group.redis.id]
  maintenance_window            = var.redis_maintenance_window
  port                          = 6379
  apply_immediately             = true
  tags                          = merge(local.common_tags, { Name = "${local.project_name}-redis" })
}

resource "aws_sqs_queue" "events" {
  name                        = "${var.project_name}-${var.environment}-events"
  visibility_timeout_seconds  = var.sqs_visibility_timeout
  message_retention_seconds   = var.sqs_message_retention
  receive_wait_time_seconds   = var.sqs_receive_wait_time
  sqs_managed_sse_enabled     = true
  tags                        = merge(local.common_tags, { Name = "${local.project_name}-events" })
}

resource "aws_ssm_parameter" "backend_env" {
  name        = "/${var.project_name}/${var.environment}/backend/.env"
  description = "Variáveis sensíveis da API"
  type        = "SecureString"
  value       = jsonencode({
    DATABASE_URL             = "postgresql://${var.postgres_username}:${var.postgres_password}@${aws_db_instance.postgres.address}:${aws_db_instance.postgres.port}/${var.postgres_database}?schema=public"
    REDIS_HOST               = aws_elasticache_replication_group.redis.primary_endpoint_address
    REDIS_PORT               = 6379
    REDIS_TLS                = true
    REDIS_ENABLED            = true
    RATE_LIMIT_REDIS_PREFIX  = "${var.project_name}:rate-limit"
    PRODUCT_CACHE_TTL_SECONDS = var.product_cache_ttl_seconds
    MESSAGE_QUEUE_URL        = aws_sqs_queue.events.id
  })
  tags = merge(local.common_tags, { Name = "${local.project_name}-backend-env" })
}

output "backend_public_ip" {
  description = "Endereço público do servidor backend"
  value       = aws_instance.backend.public_ip
}

output "database_endpoint" {
  description = "Endpoint do banco de dados PostgreSQL"
  value       = aws_db_instance.postgres.address
}

output "redis_endpoint" {
  description = "Endpoint do Redis (TLS)"
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
}

output "events_queue_url" {
  description = "URL da fila SQS para eventos"
  value       = aws_sqs_queue.events.id
}
