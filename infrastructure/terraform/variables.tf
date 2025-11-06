variable "aws_region" {
  description = "Região onde os recursos serão provisionados"
  type        = string
}

variable "project_name" {
  description = "Nome curto do projeto (ex: davidstore)"
  type        = string
}

variable "environment" {
  description = "Ambiente alvo (ex: dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "default_tags" {
  description = "Conjunto padrão de tags a serem aplicadas a todos os recursos"
  type        = map(string)
  default     = {}
}

variable "vpc_cidr" {
  description = "Bloco CIDR da VPC principal"
  type        = string
  default     = "10.10.0.0/16"
}

variable "public_subnet_cidr" {
  description = "Bloco CIDR da sub-rede pública"
  type        = string
  default     = "10.10.1.0/24"
}

variable "public_subnet_az" {
  description = "Zona de disponibilidade da sub-rede pública"
  type        = string
}

variable "private_subnet_cidr" {
  description = "Bloco CIDR da sub-rede privada"
  type        = string
  default     = "10.10.2.0/24"
}

variable "private_subnet_az" {
  description = "Zona de disponibilidade da sub-rede privada"
  type        = string
}

variable "allowed_http_cidrs" {
  description = "CIDRs autorizados a acessar o backend via HTTP/HTTPS"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "backend_ami" {
  description = "AMI utilizada pelos servidores do backend"
  type        = string
}

variable "backend_instance_type" {
  description = "Tipo da instância EC2 do backend"
  type        = string
  default     = "t3.micro"
}

variable "ssh_key_name" {
  description = "Nome da chave SSH para acesso à instância"
  type        = string
  default     = null
}

variable "backend_docker_image" {
  description = "Imagem Docker do backend publicada em um registro acessível"
  type        = string
}

variable "postgres_version" {
  description = "Versão do PostgreSQL"
  type        = string
  default     = "15.4"
}

variable "postgres_instance_class" {
  description = "Classe da instância RDS"
  type        = string
  default     = "db.t3.micro"
}

variable "postgres_username" {
  description = "Usuário administrador do banco"
  type        = string
}

variable "postgres_password" {
  description = "Senha do banco de dados"
  type        = string
  sensitive   = true
}

variable "postgres_allocated_storage" {
  description = "Armazenamento inicial (GB) do RDS"
  type        = number
  default     = 20
}

variable "postgres_max_allocated_storage" {
  description = "Armazenamento máximo (GB) permitido para autoscaling"
  type        = number
  default     = 100
}

variable "postgres_multi_az" {
  description = "Habilita replicação Multi-AZ"
  type        = bool
  default     = false
}

variable "postgres_backup_retention_days" {
  description = "Dias de retenção de backup do RDS"
  type        = number
  default     = 7
}

variable "postgres_database" {
  description = "Nome do banco de dados padrão"
  type        = string
  default     = "davidstore"
}

variable "redis_version" {
  description = "Versão do Redis"
  type        = string
  default     = "7.0"
}

variable "redis_node_type" {
  description = "Tipo do nó do ElastiCache Redis"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_maintenance_window" {
  description = "Janela de manutenção semanal do Redis"
  type        = string
  default     = "sun:05:00-sun:06:00"
}

variable "sqs_visibility_timeout" {
  description = "Timeout de visibilidade da fila SQS"
  type        = number
  default     = 30
}

variable "sqs_message_retention" {
  description = "Tempo de retenção das mensagens SQS"
  type        = number
  default     = 345600
}

variable "sqs_receive_wait_time" {
  description = "Tempo de long polling da fila SQS"
  type        = number
  default     = 10
}

variable "product_cache_ttl_seconds" {
  description = "TTL do cache de produtos em segundos"
  type        = number
  default     = 60
}
