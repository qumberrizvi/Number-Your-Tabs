chrome.tabs.query({}, function(tabs) {
    for (key in tabs) {
        chrome.tabs.executeScript(tabs[key].id,
	{file: "num_tab.js", runAt: "document_idle"});
    }
});

var default_favicon = "";
var img = new Image;
img.onload = function() {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
    default_favicon = canvas.toDataURL();
}
img.src = 'chrome://favicon/';

var changeFavicon = function(id, index) {
    chrome.tabs.sendMessage(
        id, {type: "change_favicon", index: index}, function(resp) {
            console.debug("Favicon changed for tab " + id);
        });
}

var revertFavicon = function(id, index) {
    chrome.tabs.sendMessage(
        id, {type: "revert_favicon"}, function(resp) {
            console.debug("Favicon reverted for tab " + id);
        });
}

var getAllTabsInSameWindow = function(tab, callback) {
    chrome.tabs.getAllInWindow(tab.windowid, callback);
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (!sender.tab) {
            return;
        }
        if (request == "ctrl_hold") {
            getAllTabsInSameWindow(sender.tab, function(tabs) {
                for (ind = 0; ind < tabs.length && ind < 8; ind++) {
                    changeFavicon(tabs[ind].id, ind + 1);
                }
                if (tabs.length > 8) {
                    changeFavicon(tabs[tabs.length - 1].id,
                                  9);
                }
            });

            sendResponse("");
            return;
        }

        if (request == "ctrl_release") {
            getAllTabsInSameWindow(sender.tab, function(tabs) {
                for (key in tabs) {
                    revertFavicon(tabs[key].id);
                }
            });

            sendResponse("");
            return;
        }

        if (request == "get_default_favicon") {
            sendResponse({dataurl: default_favicon});
        }
    });
