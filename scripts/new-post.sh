#!/usr/bin/env bash

# New post file generator
#  - Run via: deno task new-post

# Figure out the post date values based on the local machine's date

date_slug=$(date +%Y%m%d)
date_prop=$(date +%Y-%m-%d)

# Prompt the user for the initial content

read -p "Title of the new post: " post_title

read -p "URL text slug for the new post: " post_text_slug

if [[ -z "$post_title" || -z "$post_text_slug" ]]; then
    echo "Cancelled, both post title and slug fields are required."
    exit 1
fi

post_file="./content/posts/${date_slug}_${post_text_slug}.md"

cat > "$post_file" << EOF
---
title: ${post_title}
date: ${date_prop}
url: /posts/${date_slug}_${post_text_slug}
tags:
  - 
---


EOF


echo "Finished, new file created: ${post_file}"
exit 0
