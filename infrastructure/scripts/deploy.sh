#!/bin/bash
# InvestEd Full Stack Deploy Script
# Usage: ./deploy.sh [environment] [component]
# Components: all, network, database, backend, frontend
# Example: ./deploy.sh production all

set -euo pipefail

ENV="${1:-production}"
COMPONENT="${2:-all}"
REGION="${AWS_REGION:-us-east-1}"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/invested-${ENV}-backend"

echo "=== InvestEd Deploy (${ENV}) ==="
echo "Component: ${COMPONENT}"
echo "Region: ${REGION}"
echo "Account: ${ACCOUNT_ID}"
echo ""

deploy_stack() {
  local stack_name="$1"
  local template="$2"
  shift 2
  local params=("$@")

  echo "--- Deploying stack: ${stack_name} ---"

  local cmd=(aws cloudformation deploy
    --template-file "${template}"
    --stack-name "${stack_name}"
    --capabilities CAPABILITY_NAMED_IAM
    --region "${REGION}"
    --no-fail-on-empty-changeset)

  if [ ${#params[@]} -gt 0 ]; then
    cmd+=(--parameter-overrides "${params[@]}")
  fi

  "${cmd[@]}"
  echo "  Stack ${stack_name}: OK"
}

deploy_network() {
  deploy_stack \
    "invested-${ENV}-network" \
    "infrastructure/cloudformation/network.yml" \
    "Environment=${ENV}"
}

deploy_backend_infra() {
  # Build and push Docker image
  echo "--- Building backend Docker image ---"
  docker build -t invested-backend:latest ./backend

  echo "--- Pushing to ECR ---"
  aws ecr get-login-password --region "${REGION}" | docker login --username AWS --password-stdin "${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
  docker tag invested-backend:latest "${ECR_REPO}:latest"
  docker tag invested-backend:latest "${ECR_REPO}:$(git rev-parse --short HEAD)"
  docker push "${ECR_REPO}:latest"
  docker push "${ECR_REPO}:$(git rev-parse --short HEAD)"

  deploy_stack \
    "invested-${ENV}-backend" \
    "infrastructure/cloudformation/backend.yml" \
    "Environment=${ENV}" \
    "BackendImage=${ECR_REPO}:latest"
}

deploy_database() {
  echo "--- Database deploy requires DB password ---"
  read -rsp "DB Master Password (min 12 chars): " DB_PASSWORD; echo

  deploy_stack \
    "invested-${ENV}-database" \
    "infrastructure/cloudformation/database.yml" \
    "Environment=${ENV}" \
    "DBMasterPassword=${DB_PASSWORD}"
}

deploy_frontend() {
  local API_URL
  API_URL=$(aws cloudformation describe-stacks \
    --stack-name "invested-${ENV}-frontend" \
    --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDomainName'].OutputValue" \
    --output text --region "${REGION}" 2>/dev/null || echo "")

  if [ -z "$API_URL" ]; then
    API_URL=$(aws cloudformation describe-stacks \
      --stack-name "invested-${ENV}-backend" \
      --query "Stacks[0].Outputs[?OutputKey=='ALBDNSName'].OutputValue" \
      --output text --region "${REGION}")
  fi

  echo "--- Building frontend (API_URL: ${API_URL}) ---"
  cd frontend
  VITE_API_URL="https://${API_URL}/api/v1" npm run build
  cd ..

  deploy_stack \
    "invested-${ENV}-frontend" \
    "infrastructure/cloudformation/frontend.yml" \
    "Environment=${ENV}"

  # Sync build to S3
  local BUCKET
  BUCKET=$(aws cloudformation describe-stacks \
    --stack-name "invested-${ENV}-frontend" \
    --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" \
    --output text --region "${REGION}")

  echo "--- Uploading to S3: ${BUCKET} ---"
  aws s3 sync frontend/dist/ "s3://${BUCKET}" --delete --region "${REGION}"

  # Invalidate CloudFront cache
  local CF_ID
  CF_ID=$(aws cloudformation describe-stacks \
    --stack-name "invested-${ENV}-frontend" \
    --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" \
    --output text --region "${REGION}")

  echo "--- Invalidating CloudFront: ${CF_ID} ---"
  aws cloudfront create-invalidation --distribution-id "${CF_ID}" --paths "/*" > /dev/null
  echo "  Frontend deployed!"
}

run_migrations() {
  echo "--- Running Prisma migrations ---"
  local CLUSTER="invested-${ENV}"
  local SERVICE="invested-${ENV}-backend"

  # Get the task ARN
  local TASK_ARN
  TASK_ARN=$(aws ecs list-tasks --cluster "${CLUSTER}" --service-name "${SERVICE}" \
    --query "taskArns[0]" --output text --region "${REGION}")

  aws ecs execute-command \
    --cluster "${CLUSTER}" \
    --task "${TASK_ARN}" \
    --container backend \
    --interactive \
    --command "npx prisma migrate deploy" \
    --region "${REGION}"
}

case "${COMPONENT}" in
  all)
    deploy_network
    deploy_backend_infra
    deploy_database
    deploy_frontend
    echo ""
    echo "=== Full deploy complete! ==="
    ;;
  network)
    deploy_network
    ;;
  database)
    deploy_database
    ;;
  backend)
    deploy_backend_infra
    ;;
  frontend)
    deploy_frontend
    ;;
  migrate)
    run_migrations
    ;;
  *)
    echo "Unknown component: ${COMPONENT}"
    echo "Usage: ./deploy.sh [environment] [all|network|database|backend|frontend|migrate]"
    exit 1
    ;;
esac
