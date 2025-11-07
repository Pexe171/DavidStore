#!/bin/bash
set -euo pipefail

echo "Atualizando sistema operacional"
apt-get update -y
apt-get install -y docker.io awscli jq
systemctl enable docker
systemctl start docker

echo "Efetuando login no Amazon ECR (se necessário)"
if [[ "${docker_image}" == *".amazonaws.com"* ]]; then
  aws ecr get-login-password --region ${aws_region} \
    | docker login --username AWS --password-stdin "$(echo ${docker_image} | cut -d'/' -f1)"
fi

echo "Preparando diretórios"
mkdir -p /opt/davidstore

echo "Buscando variáveis sensíveis no AWS SSM Parameter Store"
ssm_payload=$(aws ssm get-parameter \
  --name "${ssm_parameter_name}" \
  --with-decryption \
  --region "${aws_region}" \
  --query 'Parameter.Value' \
  --output text)

echo "Criando arquivo .env do backend"
cat <<ENV >/opt/davidstore/.env
NODE_ENV=${environment}
$(printf '%s' "${ssm_payload}" | jq -r 'to_entries | .[] | "\(.key)=\(.value)"')
ENV

chmod 600 /opt/davidstore/.env

echo "Iniciando container do backend"
docker run -d \
  --name davidstore-backend \
  --restart unless-stopped \
  --env-file /opt/davidstore/.env \
  -p 80:4000 \
  ${docker_image}
