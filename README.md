# YouTube Thumbnail Viewer (YTTV)
Userscript that allows you to view (and copy / download) a YouTube video's thumbnail easily from within its description

<br>

## Current Limitations:
- Due to YouTube's wonky ass code, if you switch to another video without going back to the home / subscriptions / explore page, you will need to reload the page so YTTV can re-grab the thumbnail, else it will just give you the thumbnail of the first video you've watched.  
I don't know if there's a way I can fix this so just be aware that this happens.
- YouTube uses the WEBP format to store thumbnails on modern browsers, so the opened and downloaded thumbnails will usually also be in this format (old videos might still only have JPG or PNG).  
There's nothing I can do to convert WEBP to PNG or JPG, so you will have to use a converter like [ezgif.com](https://ezgif.com/webp-to-png)

<br><br>

## Installation:
1. Install a userscript manager extension
    > GreaseMonkey: [Firefox](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)  
    > TamperMonkey: [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) &bull; [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) &bull; [Safari](https://apps.apple.com/app/apple-store/id1482490089?mt=8) &bull; [Opera](https://addons.opera.com/en/extensions/details/tampermonkey-beta/) &bull; [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
2. Go to **[this page](https://raw.githubusercontent.com/Sv443/YT_Thumbnail_Viewer/main/yt_thumbnail_viewer.user.js)** to install or update the userscript

<br><br>

## Usage:
Expand the video description and scroll to the bottom.  
You will find a line with two links:
- **Open:** This link opens the thumbnail in a new tab. From there, you can freely copy or download it yourself by right-clicking.
- **Download**: Prompts you to download the thumbnail

<br><br>

## Planned features:
- New link to open the thumbnail in a small `<iframe>` for copying without having to open in a new tab
- A way to select a specific thumbnail resolution


<br><br>

### Legal Disclaimer:
This project is not endorsed by or affiliated with YouTube, Google or their partners.  
This script does not collect any user data.  
  
If you would like to contact me, please visit [my homepage](https://sv443.net/) or join my [Discord server.](https://dc.sv443.net/)


<br><br><br>

<div align="center" style="text-align: center;">

Made by [Sv443](https://github.com/Sv443)  
Licensed under the [MIT license](./LICENSE.txt)

</div>
