#!/usr/bin/env bash

# Release a new version to GitHub and deploy changes
#  - Run via: deno task release

# Setup the message colour characters

BLUE="\033[0;34m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
NC="\033[0m"

# Figure out the next version number

NEXT_VERSION="$(date +%Y%m%d.%H%M)"

# Ask for confirmation from the user before continuing

echo -e "${YELLOW}Create and push a new release (${NEXT_VERSION})?${NC}"
read -r -p "Continue? [y/N] " CONFIRM
CONFIRM="${CONFIRM:-n}"

if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo -e "${RED}Deployment cancelled.${NC}"
  exit 0
fi

# Build the site

echo -e "${BLUE}Building the site${NC}"

deno task build

# Run tests and exit if any tests fail

echo -e "${BLUE}Running tests${NC}"

deno task test
if [ $? -ne 0 ]; then
  echo -e "${RED}Tests failed, release aborted.${NC}"
  exit 1
fi

# Push up Git commit and tag that will trigger the GitHub Actions 'release.yml' workflow

echo -e "${BLUE}Tagging commit and pushing changes...${NC}"

git tag "$NEXT_VERSION"
git push --quiet
git push --tags --quiet

echo -e "${GREEN}Pushed to GitHub. The process will now be handled by GitHub Actions: https://github.com/bmurty/site/actions/workflows/release.yml${NC}"
