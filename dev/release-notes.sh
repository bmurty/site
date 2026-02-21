#!/usr/bin/env bash

# Generates content for the GitHub Release description
#  - Run via: deno task release-notes

# If an argument is provided when calling this script,
# like "deno task release-notes changes.log", save the output
# to that file, otherwise set a suitable default.
RELEASE_FILE=${1:-"./CHANGELOG.md"}

git fetch --tags

PREV_GIT_TAG=$(git describe --tags --abbrev=0)

GIT_REPO_COMMIT_URL="https://github.com/bmurty/site/commit/"

GIT_LOG_FORMAT="- [%s]($GIT_REPO_COMMIT_URL%h)"

git log $PREV_GIT_TAG..HEAD --oneline --no-merges --format="$GIT_LOG_FORMAT" > $RELEASE_FILE
