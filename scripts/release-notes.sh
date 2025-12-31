#!/usr/bin/env bash

# Generates content for the GitHub release description
#  - Run via: deno task release-notes

# If a value is set as an argument when calling this script,
# save output to that file. Otherwise set a suitable default
release_notes_file=${1:-"./changelog.log"}

rm -rf $release_notes_file
touch $release_notes_file

echo 'Included in the [latest release](https://github.com/bmurty/site/releases/latest):' >> $release_notes_file
echo '' >> $release_notes_file

git fetch --tags

previous_git_tag=$(git describe --abbrev=0 --tags `git rev-list --tags --skip=1 --max-count=1`)

git log $previous_git_tag..HEAD --oneline --format="- [%s](https://github.com/bmurty/site/commit/%h)" --no-merges >> $release_notes_file
