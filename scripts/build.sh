#!/usr/bin/env bash

# Build the site and organise the required assets
#  - Run via: deno task build

# Setup the message colour characters

blue="\033[0;34m"
yellow="\033[0;33m"
red="\033[0;31m"
end="\033[0m"

# Define the temporary build directory (BUILD_DIR) and public output directory (PUBLIC_DIR)

BUILD_DIR="build"
PUBLIC_DIR="public"

# Format and lint code

echo -e "${yellow}Running Deno Lint and Deno Format${end}"

deno task lint

# Start the build process

echo -e "${yellow}Clearing the '$PUBLIC_DIR' directory and recreating subdirectories${end}"

rm -rf $PUBLIC_DIR
mkdir -p $PUBLIC_DIR

echo -e "${yellow}Clearing the '$BUILD_DIR' directory and recreating subdirectories${end}"

rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR
mkdir -p $BUILD_DIR/_data
cp -r "src/styles" $BUILD_DIR/_styles
cp -r "src/templates" $BUILD_DIR/_includes
cp -r "src/layouts" $BUILD_DIR/_includes/layouts

echo -e "${yellow}Combining CSS files${end}"

mkdir -p $BUILD_DIR/_assets/css
cat $BUILD_DIR/_styles/tools-reset.css $BUILD_DIR/_styles/site.css $BUILD_DIR/_styles/media-screen-medium.css $BUILD_DIR/_styles/media-screen-small.css $BUILD_DIR/_styles/media-print.css > $BUILD_DIR/_assets/css/styles.css

echo -e "${yellow}Minifying combined CSS file${end}"

cat $BUILD_DIR/_assets/css/styles.css | \
sed -e 's/^[ \t]*//g; s/[ \t]*$//g; s/\([:{;,]\) /\1/g; s/ {/{/g; s/\/\*.*\*\///g; /^$/d' | sed -e :a -e '$!N; s/\n\(.\)/\1/; ta' | tr '\n' ' ' > $BUILD_DIR/_assets/css/styles.min.css

echo -e "${yellow}Building photo posts for photos in 'inbox' directory${end}"

mkdir -p inbox
deno run --allow-read --allow-write --allow-net src/photo-posts-generate.ts

echo -e "${yellow}Removing EXIF data from all files in the 'assets/images' directory${end}"

exiftool -recurse -all= assets/images
exiftool -recurse -delete_original assets/images

echo -e "${yellow}Copying over page content files to '$BUILD_DIR'${end}"

cp -r content/* $BUILD_DIR

echo -e "${yellow}Building the front-end using Lume and '_config.ts'${end}"

cp config/lume.config.ts _config.ts
deno task lume
rm _config.ts

echo -e "${yellow}Updating '$PUBLIC_DIR/sitemap.xml' to use the production URL${end}"

sed -i -e "s/http:\/\/localhost\//https:\/\/murty.au\//g" $PUBLIC_DIR/sitemap.xml
rm -rf $PUBLIC_DIR/sitemap.xml-e

echo -e "${yellow}Configuring GitHub Pages in the '$PUBLIC_DIR' directory${end}"

# Domain name configuration
cp "config/CNAME" "$PUBLIC_DIR/CNAME"

# Custom 404 page
cp "assets/redirect.html" "$PUBLIC_DIR/404.html"

echo -e "${yellow}Copying static files to the '$PUBLIC_DIR' directory${end}"

cp -r "assets/fonts" "$PUBLIC_DIR/fonts"
cp -r "assets/images" "$PUBLIC_DIR/images"
cp "assets/.nojekyll" "$PUBLIC_DIR/.nojekyll"
cp "assets/favicon.ico" "$PUBLIC_DIR/favicon.ico"
cp "config/robots.txt" "$PUBLIC_DIR/robots.txt"

mkdir -p "$PUBLIC_DIR/.well-known"
cp "config/keybase.txt" "$PUBLIC_DIR/.well-known/keybase.txt"
cp "config/security.txt" "$PUBLIC_DIR/.well-known/security.txt"

echo -e "${yellow}Copying CSS files to the '$PUBLIC_DIR/css' directory${end}"

mkdir -p $PUBLIC_DIR/css
cp "$BUILD_DIR/_assets/css/styles.min.css" "$PUBLIC_DIR/css/styles.min.css"
cp -r "src/styles/fontawesome" $PUBLIC_DIR/css

echo -e "${yellow}Building the JSON Feed for Brendan's posts${end}"

mkdir -p $PUBLIC_DIR/brendan
deno run --allow-read --allow-write --allow-env src/json-feed.ts
