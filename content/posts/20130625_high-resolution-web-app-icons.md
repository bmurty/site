---
title: High resolution web app icons
date: 2013-06-25
url: /posts/20130625_high-resolution-web-app-icons/
oldUrl: /brendan/posts/20130625_high-resolution-web-app-icons/
tags:
  - HTML
  - Media
---

Web apps like **UpcomingTasks** are put to better use when they are added to home screens on devices. This allows the user to access them quickly and your web app earns it's place amongst the users' other apps.

There are a few things to remember when implementing this feature in your web app.

#### iOS and Android

To ensure that [iOS](http://www.apple.com/ios/) doesn't apply the default shine to your icon, you'll need to use the correct tag in the _head_ section of your page:

```
<link rel="apple-touch-icon-precomposed" href="/images/logo-114.png">
```

[Android](http://www.android.com/) browsers also support this method, sweet!

#### Windows 8

For Windows 8/RT devices, you'll just need to include the following in the _head_ section of your page:

```
<meta name="application-name" content="YourWebApp"/>
<meta name="msapplication-TileColor" content="#325ba0"/>
<meta name="msapplication-TileImage" content="/images/logo-144-clear.png"/>
<meta name="msapplication-starturl" content="/webapphome.php" />
```

#### Windows Phone

Unfortunately, [Windows Phone](http://www.windowsphone.com/) requires a little more setup. You'll have to form up a unique page for Windows Phone users, a sample _pin to start page_ is:

```
<!doctype html>
<html>
  <head>
    <title>YourWebApp</title>
    <meta charset="utf-8">
    <meta name="robots" content="noindex,nofollow">
    <meta name="viewport" content="maximum-scale=1,minimum-scale=1,width=device-width">
    <style>
      body{margin:0;position:relative;background-color:#325ba0;color:#fff;height:100%;width:100%;padding:0}
      #icon{font-size:160px;line-height:320px;text-align:center}
      #instructions{margin-top:60px;text-align:center;position:relative;color:#eee}
      #instructions strong{color:#fff}
    </style>
  </head>
  <body>
    <div id="icon">
      <p>
        <img src="/images/logo-160.png" alt="YourWebApp" />
      </p>
    </div>
    <div id="instructions">
      <p>
        Tap <strong>...</strong> and select <strong>pin to start</strong>
      </p>
    </div>
    <script>
      var url = 'https://yourwebapp.com/webapphome.php';
      if(localStorage.getItem(url)) {
        window.location.replace(url);
      }else{
        localStorage.setItem(url, true);
      }
    </script>
  </body>
</html>
```

This will produce a screen similar to the image below:

![Add to home page](/images/brendan/addtohome-page.jpg)

And after following the directions on the page, it's now on the user's home screen:

![Home screen](/images/brendan/homescreen.png)

Looks great!

I'd also recommend a guide to assist your users in adding the page to their home screen, as I've done for UpcomingTasks on the Add to Home page.

#### Notes

- Images referenced in the sample code above should be square PNGs at 114px and 160px square respectively
- The image used above named _logo-144-clear.png_ should be a 144px square transparent PNG
- Replace *https://yourwebapp.com/webapphome.php* with the complete URL to your web app's home page
- Replace _YourWebApp_ with the name of your web app
- You might need to customise the colours defined in the CSS to match your app's design
- The JavaScript in the Windows Phone page is required so the browser knows to redirect to the app home page after the first view

#### Sources and inspiration

- [iOS Web App Configuration](https://gist.github.com/jdaihl/472519)
- [Making An Awesome Windows 8 Pinned Tile for your Website](http://dontcodetired.com/blog/post/Making-An-Awesome-Windows-8-Pinned-Tile-for-your-Website.aspx)
- [Creating a pinnable Windows Phone 7 tile for your website like Google](http://www.russellbeattie.com/blog/creating-a-pinnable-windows-phone-7-tile-for-your-website-like-google)
