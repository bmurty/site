#!/usr/bin/env bash

# Fail early if Deno isn't found
which deno || echo 'ERROR - Install Deno first from https://deno.com/' && exit 1

# Setup a local version of the Deno binary
mkdir -p ./bin
rm -rf ./bin/deno
cp $(which deno) ./bin

# Completed without errors
echo 'DONE - Local Deno setup at ./bin/deno'
exit 0
