---
title: Custom error handler
date: 2013-02-04
url: /posts/20130204_custom-error-handler/
oldUrl: /brendan/posts/20130204_custom-error-handler/
tags:
  - PHP
---

When a website or web app is viewable publically, it's a good idea to modify how PHP errors are handled. The default is to show a, sometimes dangerously detailed, error to the visitor. A much better way of handling this is to send an email to the developer and hide the error details from the visitor.

![Sample error messages](/images/brendan/error-messages.jpg)
_Showing error details to the visitor isn't good_

<script src="https://gist.github.com/bmurty/dfd5ba0cd6769f16b19eedae1044e339.js"></script>
