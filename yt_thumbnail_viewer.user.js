// ==UserScript==
// @name         YT Thumbnail Viewer
// @namespace    https://github.com/Sv443/YT_Thumbnail_Viewer
// @version      0.1.0
// @license      MIT
// @description  Adds a link to the video description to open the video's thumbnail
// @author       Sv443
// @copyright    2021, Sv443 (https://github.com/Sv443)
// @match        https://www.youtube.com/watch*
// @icon         https://www.google.com/s2/favicons?domain=youtube.com
// @run-at       document-start
// @downloadURL  https://raw.githubusercontent.com/Sv443/YT_Thumbnail_Viewer/main/yt_thumbnail_viewer.user.js
// @updateURL    https://raw.githubusercontent.com/Sv443/YT_Thumbnail_Viewer/main/yt_thumbnail_viewer.user.js
// ==/UserScript==


/**
 * @typedef {object} ThumbnailObj
 * @prop {string} url
 * @prop {number} width
 * @prop {number} height
 */


"use strict";


(function() {
    document.addEventListener("DOMContentLoaded", addLink);
    window.addEventListener("popstate", reRender);

    // TODO: re-render doesn't work
    // Maybe try observing `#movie_player video.video-stream` for change of `src` attribute?


    const settings = {
        titleMaxLength: 64,
        fileNameReplaceRegex: /[^a-zA-Z0-9_\-+#'(){}[\]$%=\s]/g
    };

    /**
     * Contains info about this script
     */
    const info = {
        /** @type {string} */
        name: GM.info.script.name,        // eslint-disable-line no-undef
        /** @type {string} */
        version: GM.info.script.version,  // eslint-disable-line no-undef
        /** @type {string} */
        desc: GM.info.script.description, // eslint-disable-line no-undef
        /** @type {string} */
        repo: GM.info.script.namespace,   // eslint-disable-line no-undef
    };


    /**
     * Run to grab the thumbnail link and add a link to the video description
     */
    async function addLink()
    {
        const thumbs = getThumbnails();

        if(thumbs.length === 0)
        {
            console.error(`${info.name} - Couldn't find any thumbnails associated with this video (or I wrote some broken code which is also possible)`);
            return;
        }

        const thumbHighestRes = thumbs.sort((a, b) => ((a.width + a.height) < (b.width + b.height)))[0];

        const thumbResString = getThumbResString(thumbHighestRes);


        //#SECTION create elements

        const yttvContainer = document.createElement("div");
        yttvContainer.id = "yttv_container";
        yttvContainer.style = "display: block; margin-top: 40px;";

        const infoElem = document.createElement("span");
        infoElem.id = "yttv_info_text";
        infoElem.innerText = `Video Thumbnail [${thumbResString}]: `;

        const openElem = document.createElement("a");
        openElem.id = "yttv_thumbnail_link";
        openElem.innerText = `Open`;
        openElem.target = "_blank";
        openElem.href = thumbHighestRes.url;

        const bullElem = document.createElement("span");
        bullElem.innerText = " • ";

        const downloadElem = document.createElement("a");
        downloadElem.id = "yttv_thumbnail_download";
        downloadElem.innerText = "Download";
        downloadElem.href = await toDataURL(thumbHighestRes.url);
        downloadElem.download = getDownloadName(thumbResString);


        //#SECTION attach elements

        // concat elements into container
        [
            infoElem,
            openElem,
            bullElem,
            downloadElem,
        ]
        .forEach(el => yttvContainer.appendChild(el));

        // use MutationObserver to scan for mutations in the DOM, to add the thumbnail links only when the video description element exists
        const observer = new MutationObserver((mutations, mo) => {
            const descriptionElem = document.querySelector("#content > #description");

            if(descriptionElem)
            {
                descriptionElem.appendChild(yttvContainer);
                mo.disconnect();
            }
        });

        // triple redundancy because YT performance is already bullshit, no need to make it worse
        const observeElem = document.querySelector("#primary-inner #meta-contents ytd-expander") || document.querySelector("#primary-inner #meta-contents") || document.querySelector("ytd-app") || document.body;

        observer.observe(observeElem, {
            childList: true,
            subtree: true
        });

        console.info(`Added ${thumbResString} thumbnail links to description (${info.name} v${info.version} - ${info.repo})`);

        document.dispatchEvent(new Event("yttv_done"));
    }

    function reRender()
    {
        console.info(`Video switched, re-rendering thumbnail viewer elements`);

        const cont = document.querySelector("#yttv_container");

        if(cont)
            cont.parentElement.removeChild(cont);

        addLink();
    }

    /**
     * Convert a URL to a data URL
     * @param {string} url 
     * @returns {string}
     */
    async function toDataURL(url)
    {
        const fetched = await fetch(url);
        const blob = await fetched.blob();
        const objUrl = URL.createObjectURL(blob);

        return objUrl;
    }

    /**
     * Returns the download name of the thumbnail
     * @param {string} thumbResString Thumbnail's resolution as a string
     * @returns {string}
     */
    function getDownloadName(thumbResString)
    {
        const title = ytInitialPlayerResponse.videoDetails.title; // eslint-disable-line no-undef

        const thumbName = (title.length > settings.titleMaxLength ? title.substr(0, settings.titleMaxLength) : title);

        return `${thumbName.replace(settings.fileNameReplaceRegex, "_") || "thumbnail"}_${thumbResString}`;
    }

    /**
     * Turns a thumbnail object into a string in the format `WIDTHxHEIGHT`
     * @param {ThumbnailObj} thumbnail
     * @returns {string}
     */
    function getThumbResString(thumbnail)
    {
        return `${thumbnail.width}x${thumbnail.height}`;
    }

    /**
     * Returns all thumbnail versions that are available on this video.  
     * Returns an empty array if there are none.
     * @returns {ThumbnailObj[]}
     */
    function getThumbnails()
    {
        try
        {
            return ytInitialPlayerResponse.videoDetails.thumbnail.thumbnails || []; // eslint-disable-line no-undef
        }
        catch(err)
        {
            return [];
        }
    }
})();
