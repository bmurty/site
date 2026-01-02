---
title: Create website shortcut apps in Chrome
date: 2013-05-11
url: /posts/20130511_chrome-website-shortcut-apps/
oldUrl: /brendan/posts/20130511_chrome-website-shortcut-apps/
tags:
  - Customisation
  - Chrome
---

The [Chrome Web Store](https://chrome.google.com/webstore) offers a huge library of free and paid _apps_ for use in the [Chrome](https://www.google.com/intl/en/chrome/browser/) browser. However, if you're simply after a quick way to access the key websites you use day to day, creating a shortcut app doesn't require huge amounts of effort.

![Chrome apps sample](/images/brendan/chrome-apps.png)
_Some of my current shortcut apps_

Basically, a Chrome shortcut app consists of two files: a plain text JSON file and an PNG image for the icon. These files should be stored in the same folder.

The image should be a 128px x 128px transparent PNG, named **128.png**.

The JSON file is pretty simple, check out the example below and name it **manifest.json**.
Customise this by updating the _name_, _description_, _urls_ and _web_url_ values as needed.

```
{
  "name": "Basecamp",
  "description": "Shortcut to Basecamp Launchpad",
  "manifest_version": 2,
  "version": "1.0.0.0",
  "icons": {
    "128": "128.png"
  },
  "app": {
    "urls": ["https://launchpad.37signals.com/"],
    "launch": {
      "web_url": "https://launchpad.37signals.com/"
    }
  },
  "permissions": ["unlimitedStorage","notifications"]
}
```

Now to add this shortcut app to Chrome. From the Chrome menu, select _Tools_ > _Extensions_, then click the _Load unpacked extension_ button. Browse to the folder in which these files are stored in and press OK/Confirm.

Now when you open a new tab, you should see your new icon! Also, you can customise your shortcut app by right clicking on it.

![Customise shortcut app](/images/brendan/chrome-app-customise.png)
_I think this one deserves a pin_
