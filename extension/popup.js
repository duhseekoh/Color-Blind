console.log("test");
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript(null, {
    file: "bookmarklet.js"
  });
});