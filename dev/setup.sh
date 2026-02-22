#!/usr/bin/env bash
#
# Setup directories, check for and install dependencies, used for local environments and in CI
#  - Run via: deno task setup

# Recreate build directories

build_dirs=("./build" "./public")

for build_dir in "${build_dirs[@]}"; do
  rm -rf "$build_dir"
  mkdir -p "$build_dir"
done

# Setup an initial ENV file if it doesn't already exist

if [ ! -f "./.env" ]; then
  cp "./.env.example" "./.env"
fi

# Install project dependencies

deno task deps-install

# Done

exit 0
