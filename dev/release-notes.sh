#!/usr/bin/env bash

# Generates content for the GitHub Release description
#  - Run via: deno task release-notes

# If an argument is provided when calling this script,
# like "deno task release-notes changes.log", save the output
# to that file, otherwise set a suitable default.
RELEASE_FILE=${1:-"./release-notes.log"}

# Fetch all tags to ensure we have the full history
git fetch --tags --force

# Get the current tag (if on a tag) or HEAD
CURRENT_REF=$(git describe --tags --exact-match 2>/dev/null || echo "HEAD")

# Get all tags sorted by version (newest first), then find the previous tag
# This works correctly in GitHub Actions where we're on the current tag
if [ "$CURRENT_REF" = "HEAD" ]; then
  # Not on a tag, get the most recent tag
  PREV_GIT_TAG=$(git describe --tags --abbrev=0 2>/dev/null)
else
  # On a tag, get all tags sorted and find the one before current
  PREV_GIT_TAG=$(git tag --sort=-version:refname | grep -A1 "^${CURRENT_REF}$" | tail -n1)

  # If grep didn't find a previous tag (current tag is the oldest), fall back
  if [ -z "$PREV_GIT_TAG" ] || [ "$PREV_GIT_TAG" = "$CURRENT_REF" ]; then
    # Get the second most recent tag
    PREV_GIT_TAG=$(git tag --sort=-version:refname | sed -n '2p')
  fi
fi

# If we still don't have a previous tag, this might be the first release
if [ -z "$PREV_GIT_TAG" ]; then
  echo "No previous tag found. This appears to be the first release."
  echo "- Initial release" > "$RELEASE_FILE"
  exit 0
fi

GIT_REPO_COMMIT_URL="https://github.com/bmurty/site/commit/"

GIT_LOG_FORMAT="- [%s]($GIT_REPO_COMMIT_URL%h)"

# Generate the commit list between previous tag and current ref
git log "$PREV_GIT_TAG..$CURRENT_REF" --oneline --no-merges --format="$GIT_LOG_FORMAT" > "$RELEASE_FILE"

# If no commits found, add a placeholder message
if [ ! -s "$RELEASE_FILE" ]; then
  echo "- No changes since previous release" > "$RELEASE_FILE"
fi
