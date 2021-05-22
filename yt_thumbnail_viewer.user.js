// ==UserScript==
// @name         YT Thumbnail Viewer
// @namespace    https://github.com/Sv443/YT_Thumbnail_Viewer
// @version      0.1.0
// @license      MIT
// @description  Adds a link to the video description to open the video's thumbnail
// @author       Sv443
// @copyright    2021, Sv443 (https://github.com/Sv443)
// @match        https://www.youtube.com/watch*
// @match        https://youtube.com/watch*
// @icon         https://www.google.com/s2/favicons?domain=youtube.com
// @run-at       document-end
// @downloadURL  https://raw.githubusercontent.com/Sv443/YT_Thumbnail_Viewer/main/yt_thumbnail_viewer.user.js
// @updateURL    https://raw.githubusercontent.com/Sv443/YT_Thumbnail_Viewer/main/yt_thumbnail_viewer.user.js
// ==/UserScript==

//#SECTION typedefs

/**
 * @typedef {object} ThumbnailObj
 * @prop {string} url
 * @prop {number} width
 * @prop {number} height
 */


"use strict";

//#SECTION main function

const YTTV = function() {

    // TODO: ´run reRender() when video is changed (since it doesn't cause a page reload)
    // Maybe try observing `#movie_player video.video-stream` for change of `src` attribute?

    unused(reRender);


    /**
     * Settings obviously, what did you think?
     * @readonly (Readonly objects cannot be modified at runtime)
     */
    const settings = Object.freeze({
        /** Max length of file names */
        fileNameMaxLength: 64,
        /** Whitelist of characters that are allowed in file names. All other characters will be replaced by the `fileNameReplaceChar` */
        fileNameReplaceRegex: /[^a-zA-Z0-9_\-+#'(){}[\]$%=\s]/g,
        /** What to replace matches of the `fileNameReplaceRegex` regex with */
        fileNameReplaceChar: "_"
    });

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

    // call entrypoint function of the userscript, this adds all elements to the DOM
    addElements();


    //#SECTION entrypoint

    /**
     * Run to grab the thumbnail link and add a link to the video description
     */
    function addElements()
    {
        //#SECTION grab thumbnails

        const thumbs = getThumbnails();

        if(thumbs.length === 0)
        {
            console.error(`${info.name} - Couldn't find any thumbnails associated with this video (or I wrote some broken code which is also possible)`);
            return;
        }

        const thumbHighestRes = thumbs.sort((a, b) => ((a.width + a.height) < (b.width + b.height)))[0];

        //#SECTION create elements

        const yttvContainer = document.createElement("div");
        yttvContainer.id = "yttv_container";
        yttvContainer.style = "display: block; margin-top: 40px;";

        const containerElements = getContainerContent(thumbHighestRes);

        //#SECTION attach elements

        // append elements onto container as children
        containerElements.forEach(el => yttvContainer.appendChild(el));

        attachContainer(yttvContainer);

        console.info(`Added thumbnail links to description (${info.name} v${info.version} - ${info.repo})`);

        document.dispatchEvent(new Event("yttv_done"));
    }

    /**
     * Attaches the YTTV container element to the video description element
     * @param {HTMLElement} yttvContainer
     */
    function attachContainer(yttvContainer)
    {
        // use MutationObserver to scan for mutations in the DOM, to add the thumbnail links only when the video description element exists
        const observer = new MutationObserver((mutations, mo) => {
            unused(mutations);

            const descriptionElem = getDescription();

            if(descriptionElem)
            {
                // attach container to video description element, then disconnect this MutationObserver
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
    }

    /**
     * Returns a list of HTMLElements that should be appended as the YTTV container's children
     * @param {ThumbnailObj} thumbHighestRes 
     * @returns {HTMLElement[]}
     */
    async function getContainerContent(thumbHighestRes)
    {
        const infoElem = document.createElement("span");
        infoElem.id = "yttv_info_text";
        infoElem.innerText = `Video Thumbnail: `;

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
        downloadElem.download = getDownloadName();

        // IMPORTANT: The order of this array is what decides the order of elements in the DOM so be careful here:
        return [
            infoElem,
            openElem,
            bullElem,
            downloadElem,
        ];
    }

    /**
     * Re-renders the DOM elements. Run this if the user switched to a different video.
     */
    function reRender()
    {
        console.info(`Video switched, re-rendering thumbnail viewer elements`);

        const cont = document.querySelector("#yttv_container");

        // remove container if it exists
        if(cont)
            cont.parentElement.removeChild(cont);

        // add elements again
        addElements();
    }

    /**
     * Fetches an image from a URL and converts it to a data URL
     * @param {string} url
     * @returns {Promise<string>}
     */
    function toDataURL(url)
    {
        return new Promise(async (res) => {
            const fetched = await fetch(url);
            const blob = await fetched.blob();
            const objUrl = URL.createObjectURL(blob);

            return res(objUrl);
        });
    }

    /**
     * Queries the DOM for the video description element
     * @returns {HTMLElement|null} Returns `null` if the description is not present
     */
    function getDescription()
    {
        return document.querySelector("#content > #description");
    }

    /**
     * Returns the download name of the thumbnail
     * @returns {string}
     */
    function getDownloadName()
    {
        const title = ytInitialPlayerResponse.videoDetails.title; // eslint-disable-line no-undef

        const thumbName = (title.length > settings.fileNameMaxLength ? title.substr(0, settings.fileNameMaxLength) : title);

        return sanitizeFileName(thumbName || "thumbnail");
    }

    /**
     * Sanitizes a file name (replaces invalid characters)
     * @param {string} fileName
     * @returns {string}
     */
    function sanitizeFileName(fileName)
    {
        return fileName.replace(settings.fileNameReplaceRegex, settings.fileNameReplaceChar);
    }

    // /**
    //  * Turns a thumbnail object into a string in the format `WIDTHxHEIGHT`
    //  * @param {ThumbnailObj} thumbnail
    //  * @returns {string}
    //  */
    // function getThumbResString(thumbnail)
    // {
    //     return `${thumbnail.width}x${thumbnail.height}`;
    // }

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

    /**
     * Annotates one or more unused variable(s)
     * @param  {...any} any
     * @returns {void} Always returns void (undefined)
     */
    function unused(...any)
    {
        // do nothing
        void any;
    }
};

// run YTTV script
YTTV();
