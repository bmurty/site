---
title: Add some character to your website with themes
date: 2013-01-31
url: /posts/20130131_add-some-character-to-your-website-with-themes/
oldUrl: /brendan/posts/20130131_add-some-character-to-your-website-with-themes/
tags:
  - PHP
  - CSS
---

It's easy to add themes to your website and allow your visitors to customise their experience. This post will guide you through implementing theme support on your website using [PHP](http://php.net/), [CSS](http://en.wikipedia.org/wiki/Cascading_Style_Sheets) and [cookies](http://en.wikipedia.org/wiki/HTTP_cookie).

There are a few requirements of a theming system:

1. Setting up your CSS files
2. Showing a list of themes
3. Allow the user to select a theme
4. Include the selected theme styles

### Setting up your CSS files

This method is designed around the idea of placing common styles in a file named *common.css *and placing theme specific styling in other CSS files. The filename of these files will become the theme name, like so:

- _red.css_ is displayed as _Red_
- _dark-blue.css_ is displayed as _Dark Blue_
- _salmon.css_ is displayed as _Salmon_

For this example, the CSS files are placed in a top level folder named _styles_. Feel free to update this by changing the value of the **$folder** variables in the PHP functions.

<script src="https://gist.github.com/bmurty/24650665daf4fd0b37a740f642a46ce7.js"></script>

### Notes

Themes aren't suitable for every website, so use them wisely to allow for customisations that suit your visitors' needs. Also, don't forget to ensure your default theme remains usable, including suitably sized text and clear link styling.
