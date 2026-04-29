#!/bin/bash
# INVESTED-286: Configure secrets management via AWS SSM Parameter Store
# Usage: ./setup-secrets.sh [environment]
# Secrets are stored as SecureString (encrypted with AWS KMS)
# Rotatable without redeployment — just update the parameter and restart ECS

set -euo pipefail

ENV="${1:-production}"
REGION="${AWS_REGION:-us-east-1}"
PREFIX="/invested/${ENV}"

echo "=== InvestEd Secrets Setup (${ENV}) ==="
echo "Region: ${REGION}"
echo "Parameter prefix: ${PREFIX}"
echo ""

# Prompt for each secret
read -rp "DATABASE_URL (postgresql://user:pass@host:5432/invested): " DATABASE_URL
read -rp "REDIS_URL (redis://host:6379): " REDIS_URL
read -rsp "JWT_SECRET: " JWT_SECRET; echo
read -rsp "JWT_REFRESH_SECRET: " JWT_REFRESH_SECRET; echo
read -rsp "MASSIVE_API_KEY: " MASSIVE_API_KEY; echo
read -rp "EMAIL_USER (Gmail address): " EMAIL_USER
read -rsp "EMAIL_PASS (Gmail app password): " EMAIL_PASS; echo

echo ""
echo "Storing secrets in SSM Parameter Store..."

store_param() {
  local name="$1"
  local value="$2"

  if [ -z "$value" ]; then
    echo "  SKIP: ${PREFIX}/${name} (empty)"
    return
  fi

  aws ssm put-parameter \
    --name "${PREFIX}/${name}" \
    --type SecureString \
    --value "${value}" \
    --overwrite \
    --region "${REGION}" \
    --tags "Key=project,Value=invested" "Key=environment,Value=${ENV}" \
    > /dev/null 2>&1

  echo "  OK: ${PREFIX}/${name}"
}

store_param "DATABASE_URL" "$DATABASE_URL"
store_param "REDIS_URL" "$REDIS_URL"
store_param "JWT_SECRET" "$JWT_SECRET"
store_param "JWT_REFRESH_SECRET" "$JWT_REFRESH_SECRET"
store_param "MASSIVE_API_KEY" "$MASSIVE_API_KEY"
store_param "EMAIL_USER" "$EMAIL_USER"
store_param "EMAIL_PASS" "$EMAIL_PASS"

echo ""
echo "=== Done! ==="
echo "Secrets stored at: ${PREFIX}/*"
echo ""
echo "To rotate a secret without redeployment:"
echo "  aws ssm put-parameter --name ${PREFIX}/JWT_SECRET --type SecureString --value 'new-value' --overwrite"
echo "  aws ecs update-service --cluster invested-${ENV} --service invested-${ENV}-backend --force-new-deployment"
