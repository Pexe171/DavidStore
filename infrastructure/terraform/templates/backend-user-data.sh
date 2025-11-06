#!/bin/bash
set -euo pipefail

echo "Atualizando sistema operacional"
apt-get update -y
apt-get install -y docker.io awscli
systemctl enable docker
systemctl start docker

echo "Efetuando login no Amazon ECR (se necessário)"
if [[ "${docker_image}" == *".amazonaws.com"* ]]; then
  aws ecr get-login-password --region ${aws_region} \
    | docker login --username AWS --password-stdin "$(echo ${docker_image} | cut -d'/' -f1)"
fi

echo "Preparando diretórios"
mkdir -p /opt/davidstore

echo "Criando arquivo .env do backend"
cat <<ENV >/opt/davidstore/.env
NODE_ENV=${environment}
DATABASE_URL=${database_url}
REDIS_HOST=${redis_host}
REDIS_PORT=6379
REDIS_TLS=true
MESSAGE_QUEUE_URL=${sqs_queue_url}
ENV

chmod 600 /opt/davidstore/.env

echo "Iniciando container do backend"
docker run -d \
  --name davidstore-backend \
  --restart unless-stopped \
  --env-file /opt/davidstore/.env \
  -p 80:4000 \
  ${docker_image}
