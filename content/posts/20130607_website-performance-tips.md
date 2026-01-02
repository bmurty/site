---
title: Website performance tips
date: 2013-06-07
url: /posts/20130607_website-performance-tips/
oldUrl: /brendan/posts/20130607_website-performance-tips/
tags:
  - Performance
---

[Colt McAnlis](https://twitter.com/duhroach) gave an insightful talk recently named _Performance Checklist for the Mobile Web_ ([Video](http://www.youtube.com/watch?v=0UNWi7FA36M), [Slides](http://mainroach.appspot.com/docs/PCMW.pdf)), where he explains:

> One in four users will abandon a site if it's not loaded in three seconds

Is that enough time to load that crazy video slider the client wants on the home page? Probably not. Statistics like this one help developers and clients focus their ideas in to what really matters: _the main message of the website_.

If you've removed all the superfluous content and are still struggling with the load time, there are ways developers can optimise website performance. [Let's have a look](https://vine.co/v/bQbrUJPzJ5Y).

## Find an appropriate web host

Consider the options and select the [web host](http://en.wikipedia.org/wiki/Web_hosting_service) that suits the project's needs, such as:

- What programming languages do you need it to support?
- Which country should the server be located in?
- Do they have automatic backup systems in place?

Look for companies with a proven history of great service, value and support. Personally, I use [MediaTemple](http://mediatemple.net/). Some other options are [RackSpace](http://www.rackspace.com.au/) and [NetRegistry](http://www.netregistry.com.au/web-hosting/cloud-hosting/).

## Use a performance testing tool

Use tools like [WebPageTest](http://www.webpagetest.org/) and [PageSpeed](https://developers.google.com/speed/pagespeed/) to get feedback on where a website's performance can improve.

## Minify

Reduce the size of CSS and JS files by [minifying](<http://en.wikipedia.org/wiki/Minification_(programming)>) their contents in production environments, I recommend [Online YUI Compressor](http://refresh-sf.com/yui) for this.

## Use image sprites

When your design requires a large amount of images, you can speed this up by combining them in to one sprite image. Then you can show certain sections of the image where needed via CSS.

An A List Apart article, [CSS Sprites: Image Slicing's Kiss of Death](http://alistapart.com/article/sprites), explains this technique much better than I can.

## Reduce the length of CSS selectors

Don't be so specific! Longer selectors take longer for the browser to interpret, which affects page load times.

Too specific:

```
ul.post-list li div.author span.name{
  font-size:90%;
}
```

Much better:

```
.post-list .name{
  font-size:90%;
}
```

## Set caching rules for certain file types

Most of the assets included in a web page don't change very often, especially images.
If you're using [Apache](http://en.wikipedia.org/wiki/Apache_web_server) as your web server, you can tell the browser when it needs to check for a new version in a [.htaccess file](http://en.wikipedia.org/wiki/Htaccess):

```
<filesMatch ".(ico|gif|jpg|png|eot|ttf|woff|svg)$">
  ExpiresActive On
  ExpiresDefault "access plus 11 month"
  Header append Cache-Control "public"
</filesMatch>
<filesMatch ".(css|js)$">
  ExpiresActive On
  ExpiresDefault "access plus 1 month"
  Header append Cache-Control "public"
</filesMatch>
```

This will tell the browser to keep a cached version of image files for up to a year, and CSS and JS files for a month.

## Setup gzip compression

[Gzip compression](https://developers.google.com/speed/articles/gzip) is a technique to compress HTML at the web server level before it reaches the visitor's browser. To enable it, add the following to your _.htaccess file_:

```
<ifmodule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/text text/html text/plain text/xml text/css application/x-javascript application/javascript
</ifmodule>
```

