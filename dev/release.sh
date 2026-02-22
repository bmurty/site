#!/usr/bin/env bash

# Release a new version to GitHub and deploy changes
#  - Run via: deno task release

# Setup the message colour characters

blue="\033[0;34m"
green="\033[0;32m"
yellow="\033[0;33m"
red="\033[0;31m"
end="\033[0m"

# Figure out the next version number

NEXT_VERSION="$(date +%Y%m%d.%H%M)"

# Ask for confirmation from the user before continuing

read -p "$(echo -e $blue"Are you sure you want to create a new release ("$NEXT_VERSION")? (y/n) "$end)" ANSWER
if [ "$ANSWER" != "y" ]; then
  echo -e "${red}User cancelled, release aborted.${end}"
  exit 1
fi

# Build the site

echo -e "${blue}Building the site${end}"

deno task build

# Run tests and exit if any tests fail

echo -e "${blue}Running tests${end}"

deno task test
if [ $? -ne 0 ]; then
  echo -e "${red}Tests failed, release aborted.${end}"
  exit 1
fi

# Push up Git commit and tag that will trigger the GitHub Actions 'release.yml' workflow

echo -e "${blue}Tagging commit and pushing changes...${end}"

git tag "$NEXT_VERSION"
git push --quiet
git push --tags --quiet

echo -e "${green}Pushed to GitHub. The process will now be handled by GitHub Actions: https://github.com/bmurty/site/actions/workflows/release.yml${end}"
