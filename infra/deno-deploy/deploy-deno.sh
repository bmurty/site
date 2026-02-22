#!/usr/bin/env bash
# Deploys the built site to Deno Deploy using deployctl
#  - Run via: bash ./infra/deno-deploy/deploy-deno.sh

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="${DENO_DEPLOY_PROJECT:-}"
ENTRYPOINT="${ENTRYPOINT:-jsr:@std/http/file-server}"
SITE_DIR="${SITE_DIR:-./public}"

# Validate required vars
if [ -z "$PROJECT_NAME" ]; then
  echo -e "${RED}Error: DENO_DEPLOY_PROJECT environment variable is required${NC}"
  echo ""
  echo "Usage:"
  echo "  export DENO_DEPLOY_PROJECT=your-project-name"
  echo "  bash ./infra/deno-deploy/deploy-deno.sh"
  echo ""
  echo "Optional environment variables:"
  echo "  DENO_DEPLOY_TOKEN - API token (required if not authenticated via deployctl)"
  echo "  ENTRYPOINT        - Defaults to jsr:@std/http/file-server"
  echo "  SITE_DIR          - Directory to deploy, defaults to ./public"
  exit 1
fi

# Validate the site directory exists and is non-empty
if [ ! -d "$SITE_DIR" ]; then
  echo -e "${RED}Error: Site directory '$SITE_DIR' does not exist${NC}"
  echo "Run 'deno task build' first to generate the site."
  exit 1
fi

if [ -z "$(ls -A "$SITE_DIR")" ]; then
  echo -e "${RED}Error: Site directory '$SITE_DIR' is empty${NC}"
  echo "Run 'deno task build' first to generate the site."
  exit 1
fi

# Check deployctl is available
if ! command -v deployctl &>/dev/null; then
  echo -e "${YELLOW}deployctl not found, installing...${NC}"
  deno install -gArf jsr:@deno/deployctl
fi

echo -e "${GREEN}Deno Deploy Deployment${NC}"
echo "======================================"
echo "  Project:    $PROJECT_NAME"
echo "  Site dir:   $SITE_DIR"
echo "  Entrypoint: $ENTRYPOINT"
echo ""

read -r -p "Deploy to Deno Deploy? [y/N] " CONFIRM
if [[ ! "$CONFIRM" =~ ^[yY]$ ]]; then
  echo -e "${YELLOW}Deployment cancelled.${NC}"
  exit 0
fi

echo ""
echo -e "${YELLOW}Deploying to Deno Deploy...${NC}"

DEPLOY_ARGS=(
  deploy
  --project="$PROJECT_NAME"
  --include="$SITE_DIR"
  "$ENTRYPOINT"
)

# Pass token if set
if [ -n "${DENO_DEPLOY_TOKEN:-}" ]; then
  DEPLOY_ARGS+=(--token="$DENO_DEPLOY_TOKEN")
fi

deployctl "${DEPLOY_ARGS[@]}"

echo ""
echo -e "${GREEN}✓ Deployment complete!${NC}"
echo ""
echo "View your deployment at: https://dash.deno.com/projects/$PROJECT_NAME"
