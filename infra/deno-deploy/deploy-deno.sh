#!/usr/bin/env bash
# Deploys the built site to Deno Deploy using the `deno deploy` CLI command
#  - Requires Deno >= 2.4.2
#  - Run via: bash ./infra/deno-deploy/deploy-deno.sh

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="${DENO_DEPLOY_PROJECT:-}"
ORG_NAME="${DENO_DEPLOY_ORG:-}"
SITE_DIR="${SITE_DIR:-./public}"

# Validate required vars
if [ -z "$APP_NAME" ]; then
  echo -e "${RED}Error: DENO_DEPLOY_PROJECT environment variable is required${NC}"
  echo ""
  echo "Usage:"
  echo "  export DENO_DEPLOY_TOKEN=your-token"
  echo "  export DENO_DEPLOY_PROJECT=your-app-name"
  echo "  bash ./infra/deno-deploy/deploy-deno.sh"
  echo ""
  echo "Optional environment variables:"
  echo "  DENO_DEPLOY_ORG - Organisation slug (required if app is under an org)"
  echo "  SITE_DIR        - Directory to deploy, defaults to ./public"
  exit 1
fi

if [ -z "${DENO_DEPLOY_TOKEN:-}" ]; then
  echo -e "${RED}Error: DENO_DEPLOY_TOKEN environment variable is required${NC}"
  echo "Get your token from: https://console.deno.com/account/tokens"
  exit 1
fi

# Validate Deno is on the latest stable version
DENO_VERSION=$(deno --version | head -1 | awk '{print $2}')
LATEST_DENO=$(curl -fsSL https://dl.deno.land/release-latest.txt | tr -d 'v\n')

if [ "$DENO_VERSION" != "$LATEST_DENO" ]; then
  echo -e "${RED}Error: Deno $LATEST_DENO is required (found $DENO_VERSION)${NC}"
  echo "Upgrade: deno upgrade"
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

echo -e "${GREEN}Deno Deploy Deployment${NC}"
echo "======================================"
echo "  App:      $APP_NAME"
echo "  Org:      ${ORG_NAME:-"(from deno.json or default)"}"
echo "  Site dir: $SITE_DIR"
echo "  Deno:     $DENO_VERSION"
echo ""

read -r -p "Deploy to Deno Deploy? [y/N] " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Deployment cancelled.${NC}"
  exit 0
fi

echo ""
echo -e "${YELLOW}Deploying to Deno Deploy...${NC}"

DEPLOY_ARGS=(
  deploy
  --app="$APP_NAME"
  --token="$DENO_DEPLOY_TOKEN"
  --static="$SITE_DIR"
  --prod
)

if [ -n "$ORG_NAME" ]; then
  DEPLOY_ARGS+=(--org="$ORG_NAME")
fi

deno "${DEPLOY_ARGS[@]}"

echo ""
echo -e "${GREEN}✓ Deployment complete!${NC}"
echo ""
echo "View your deployment at: https://console.deno.com/projects/$APP_NAME"
