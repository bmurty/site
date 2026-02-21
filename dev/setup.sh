#!/usr/bin/env bash

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

echo 'OK - Environment config file exists at ./.env'

# Attempt to install and configure direnv

if which direnv ; then
    direnv allow

    echo 'OK - direnv is installed and configured'
else
  curl -sfL https://direnv.net/install.sh | bash
  echo "$HOME/.local/bin" >> $GITHUB_PATH

  if which direnv ; then
    export PATH="$HOME/.local/bin:$PATH"

    direnv allow

    direnv export gha >> "$GITHUB_ENV"

    echo 'OK - direnv is now installed and configured'
  else
    echo 'ERROR - direnv not found, please install from https://direnv.net/'
    exit 1
  fi
fi

# Setup a local version of the Deno binary

if which deno ; then
  deno upgrade stable

  mkdir -p ./bin
  rm -rf ./bin/deno
  cp $(which deno) ./bin

  echo 'OK - Local Deno updated at ./bin/deno'
else
  if which bin/deno ; then
    echo 'OK - Local Deno found at ./bin/deno'
  else
    echo 'ERROR - Install Deno first from https://deno.com/'
    exit 1
  fi
fi

# Install Lume as a local Deno package

rm -rf ./bin/lume
deno install --global \
  --allow-run --allow-env --allow-read --allow-write=deno.json \
  --root ./bin --name lume --force --reload \
  https://deno.land/x/lume_cli/mod.ts

# Check for Git LFS install, then finish up

if which git-lfs ; then
  echo 'OK - Git LFS is installed'
else
  echo 'WARNING - Git LFS not found, attempting to install now'

  apt install -y git-lfs

  if which git-lfs ; then
    echo 'OK - Git LFS is now installed'
    echo 'DONE - Setup script finished'
    exit 0
  fi

  echo 'FAIL - Please install Git LFS manually from https://git-lfs.com/'
  echo 'DONE - Setup script finished'
  exit 1
fi

# Done

echo 'DONE - Setup command finished'
exit 0
