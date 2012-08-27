console.log("test");
    debugger;
		chrome.tabs.executeScript(null, {
	    file: "bookmarklet.js"
	  });