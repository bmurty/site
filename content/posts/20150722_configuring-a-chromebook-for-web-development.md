---
title: Configuring a Chromebook for web development
date: 2015-07-22
url: /posts/20150722_configuring-a-chromebook-for-web-development/
oldUrl: /brendan/posts/20150722_configuring-a-chromebook-for-web-development/
tags:
  - Development
  - Chrome
---

To fill the time commuting to work, I recently bought a [Chromebook](http://www.acer.co.uk/ac/en/GB/content/professional-series/chromebook11c730) which is basically a cheap laptop designed to use [Chrome Apps](https://chrome.google.com/webstore/category/apps) instead of traditional, installable desktop applications.

Chromebook devices run [Chrome OS](https://en.wikipedia.org/wiki/Chrome_OS) created by Google and based on the [Linux kernel](https://en.wikipedia.org/wiki/Linux_kernel). Access to the operating system and Linux shell is hidden by default but you can access it with a bit of effort to unlock it's full potential.

#### Setup a local development environment

1. [Enable Developer Mode](http://www.howtogeek.com/210817/how-to-enable-developer-mode-on-your-chromebook/)
2. When the _OS verification is OFF_ screen is shown, press _Ctrl + D_ to dismiss the warning and boot Chrome OS
3. Login to your Google account
4. Press _Ctrl + Alt + T_ to open a terminal window
5. Type _shell_ and press _Enter_ to enter the Linux shell
6. Install the [Chromebrew](http://skycocker.github.io/chromebrew/) package manager
7. To allow for SSH connections to other servers, install [Secure Shell](https://chrome.google.com/webstore/detail/secure-shell/pnhechapfaindjhompbnflcldabbghjo)
8. To access the Linux Shell from it's own window and be able to _Pin it to the Chrome OS shelf_, install [Crosh Window](https://chrome.google.com/webstore/detail/crosh-window/nhbmpbdladcchdhkemlojfjdknjadhmh)

After this process is completed, you'll have _Git_ installed locally.

#### Git and Vim configuration

Open the _Crosh Window_ app and open the Linux Shell:

> shell

Install [Vim](http://vim.wikia.com/wiki/Vim_Tips_Wiki) so you can edit files and Git commit messages via the Terminal:

> crew install vim keep

Commands to set basic Git settings and set Vim as the default Git editor:

> git config --global user.email "your.email@sample.com"
> git config --global user.name "Your Name"
> git config --global core.editor "vim"

Configure Vim to work with the Chromebook device by editing the _~/.vimrc_ file to include:

> set nocompatible

You might also want to [add more Vim settings](http://vim.wikia.com/wiki/Example_vimrc) to suit your needs. These will set the default settings for Vim when you edit files.

You're now ready to [git clone](http://git-scm.com/docs/git-clone) a code repository to a local folder, such as:

> ~/Downloads/
> /media/removable/SD Card/

#### Improve productivity

To create a shortcut command called _cdgit_ for getting to a _Git_ folder on an _SD card_, add the following to the end of the _~/.bashrc_ file:

> alias cdgit='cd /media/removable/SD\ Card/Git' # Change directory to the Git folder on the SD card

To avoid the annoying system beep on startup while in _Developer Mode_, just press _Ctrl + D_ when the _OS verification is OFF_ screen is shown.

If you'd prefer a more modern text editor, you can install one from the Web Store, such as [Caret](https://chrome.google.com/webstore/detail/caret/fljalecfjciodhpcledpamjachpmelml).

#### Ready to go!

You now have a cheap, portable device to develop your next web app on!
