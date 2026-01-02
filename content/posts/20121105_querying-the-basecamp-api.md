---
title: Querying the Basecamp 2 API
date: 2012-11-05
url: /posts/20121105_querying-the-basecamp-api/
oldUrl: /brendan/posts/20121105_querying-the-basecamp-api/
tags:
  - PHP
  - Basecamp
---

After using [Basecamp 2](http://basecamp.com/2) for some time on my [Windows Phone](http://windowsphone.com/), I decided to build a third-party web based mobile client to improve the system for mobile devices. This became **UpcomingTasks**.</p>

One of the most basic requirements of the web client was that it needed to query the [Basecamp API](https://github.com/37signals/bcx-api) and return the results for display. Here's my _bc_results_ PHP function that got the job done:

<script src="https://gist.github.com/bmurty/8d9e626dc58e44831c332208d15bda55.js"></script>
