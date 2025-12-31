#!/usr/bin/env bash

# Setup command - Run via "deno task setup"

# Recreate build directories

build_dirs=("./build" "./inbox" "./public")

for build_dir in "${build_dirs[@]}"; do
    rm -rf "$build_dir"
    mkdir -p "$build_dir"
done

# Setup an initial ENV file if it doesn't already exist

if [ ! -f "./.env" ]; then
    cp "./config/.env.example" "./.env"
fi

echo 'OK - Environment config file exists at ./.env'

# Setup a local version of the Deno binary

if which deno ; then
    deno upgrade stable

    mkdir -p ./bin
    rm -rf ./bin/deno
    cp $(which deno) ./bin

    echo 'OK - Local Deno setup at ./bin/deno'
else
    echo 'ERROR - Install Deno first from https://deno.com/'
    exit 1
fi

# Install Lume packages for Deno

deno install --global --allow-run --allow-env --allow-read --allow-write=deno.json --name lume --force --reload https://deno.land/x/lume_cli/mod.ts

# Install ExifTool

if which exiftool ; then
    echo 'OK - ExifTool is installed'
else
    echo 'WARNING - ExifTool not found, please install from https://exiftool.org/'
fi

# Install direnv

if which direnv ; then
    direnv allow

    echo 'OK - direnv is installed and configured'
else
    echo 'WARNING - direnv not found, please install from https://direnv.net/'
fi

# Done

echo 'DONE - Setup command finished'
