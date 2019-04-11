var isMac = navigator.userAgent.indexOf('Mac OS X') != -1;

var ready = false;
var links = document.querySelectorAll("link[rel~='icon']");
if (links.length == 0) {
    var link = document.createElement("link");
    link.setAttribute("rel", "icon");
    link.href = "/favicon.ico";
    document.head.appendChild(link);
    var links = document.querySelectorAll("link[rel~='icon']");
}
var original_favicon_url = links[0].href;

// Test if the favicon exists.
// Do not change the favicon if it does not exist originally. Otherwise chrome
// can cache our number favicon.
var _img = document.createElement("img");
_img.onload = function() {
    ready=true;
}
_img.onerror = function() {
    chrome.runtime.sendMessage("get_default_favicon", function(response) {
        if (response.dataurl == "") {
            return;
        }
        original_favicon_url = response.dataurl;
        ready=true;
    });
}
_img.src = original_favicon_url;
_img.style.display = "none";
document.body.appendChild(_img);

var numFavicon = function(num) {
    if (!ready) {
        return;
    }
    for (var i = 0; i < links.length; i++) {
        links[i].href = 'chrome-extension://' +
            chrome.i18n.getMessage('@@extension_id') +
            '/favicon/favicon-' + num + '.gif';
    }
}

var revertFavicon = function() {
    if (!ready) {
        return;
    }
    for (var i = 0; i < links.length; i++) {
        links[i].href = original_favicon_url;
    }
}

var sendCtrlHold = function() {
    chrome.runtime.sendMessage("ctrl_hold", function(response) {
    });
}

var sendCtrlRelease = function() {
    chrome.runtime.sendMessage("ctrl_release", function(response) {
    });
}

var isCtrlDown = false;
document.onkeydown=function(event) {
    if (!isCtrlDown && (isMac && event.metaKey ||
                        !isMac && (event.ctrlKey || event.altKey))) {
        isCtrlDown = true;
        sendCtrlHold();
    }
}
document.onkeyup=function(event) {
    if (isCtrlDown && (isMac && !event.metaKey ||
                       !isMac && !(event.ctrlKey || event.altKey))) {
        isCtrlDown = false;
        sendCtrlRelease();
    }
}

window.onblur=function(event) {
    isCtrlDown = false;
    sendCtrlRelease();
}

window.onunload=function(event) {
    isCtrlDown = false;
    sendCtrlRelease();
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (sender.tab) {
            return;
        }
        if (request.type == "change_favicon") {
            numFavicon(request.index);
            sendResponse("");
        } else {
            revertFavicon();
            sendResponse("");
        }
    }
)
