#!/usr/bin/env bash
#
# Git: Update the 'main' branch to include the latest version of the 'develop' branch.
#

# Save any current changes to the Git stash

git add .
git stash

# Update both 'develop' and 'main' to be the latest versions from the 'origin' remote

git checkout develop
git pull

git checkout main
git pull

# Merge 'develop' in to 'main', accepting 'develop' as the resolution state for all conflicts

git checkout main
git merge develop -X theirs

# Make a new commit for this merge, and output the details and diff to the user

git commit -am "Merge develop in to main"
git show
