#!/bin/bash
# Rotate a single secret without redeployment
# Usage: ./rotate-secret.sh [environment] [secret-name]
# Example: ./rotate-secret.sh production JWT_SECRET

set -euo pipefail

ENV="${1:-production}"
SECRET_NAME="${2:-}"
REGION="${AWS_REGION:-us-east-1}"

if [ -z "$SECRET_NAME" ]; then
  echo "Usage: ./rotate-secret.sh [environment] [secret-name]"
  echo ""
  echo "Available secrets:"
  echo "  DATABASE_URL, REDIS_URL, JWT_SECRET, JWT_REFRESH_SECRET,"
  echo "  MASSIVE_API_KEY, EMAIL_USER, EMAIL_PASS"
  exit 1
fi

PARAM_PATH="/invested/${ENV}/${SECRET_NAME}"

echo "=== Rotate Secret: ${SECRET_NAME} (${ENV}) ==="
read -rsp "New value for ${SECRET_NAME}: " NEW_VALUE; echo

aws ssm put-parameter \
  --name "${PARAM_PATH}" \
  --type SecureString \
  --value "${NEW_VALUE}" \
  --overwrite \
  --region "${REGION}"

echo "Secret updated: ${PARAM_PATH}"
echo ""

read -rp "Force new ECS deployment to pick up change? (y/N): " DEPLOY
if [[ "$DEPLOY" =~ ^[Yy]$ ]]; then
  aws ecs update-service \
    --cluster "invested-${ENV}" \
    --service "invested-${ENV}-backend" \
    --force-new-deployment \
    --region "${REGION}" > /dev/null
  echo "ECS service restarting with new secret."
fi
