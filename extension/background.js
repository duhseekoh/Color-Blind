//Listen for an image source to be passed in and then respond with it in base64 form.
//This bypasses the security restriction placed on content scripts since they still
//adhere to the cross domain constraints that regular in page javascript does.
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
//    debugger;
    if(request.name === "getDataUrl") {
      var img = new Image();
      img.onload = function() {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var context = canvas.getContext("2d");
        context.drawImage(img, 0, 0);
        sendResponse({dataUrl: canvas.toDataURL()});
      };
      img.src = request.imageSrc;
      return true;
    }
  }
);

//Listen for a request to get styles from a cross origin css link. Create the link element
//in the background, wait for it to load, and send back a message with the stylesheet object.
chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
      debugger;
      if(request.name === "getStyleSheet") {
        loadStyleSheet(request.href, function(isSuccess, linkElement) {
          if(!isSuccess && linkElement["sheet"].rules) {
            return false;
          }

          //convert to css text array instead of passing back the css rules object because it contains
          //circular references to its parent stylesheet unfortunately.
          var cssTextArray = [],
              cssRules = linkElement["sheet"].cssRules;
          for(var i in cssRules) {
            cssTextArray.push(cssRules[i].cssText);
          }

          sendResponse({rules: cssTextArray}); //pass the stylesheet reference back
        }, this);
        return true;
      }
    }
);

//from http://stackoverflow.com/questions/5537622/dynamically-loading-css-file-using-javascript-with-callback-without-jquery
function loadStyleSheet( path, fn, scope ) {
  var head = document.getElementsByTagName( 'head' )[0], // reference to document.head for appending/ removing link nodes
      link = document.createElement( 'link' );           // create the link node
  link.setAttribute( 'href', path );
  link.setAttribute( 'rel', 'stylesheet' );
  link.setAttribute( 'type', 'text/css' );

  var sheet, cssRules;
// get the correct properties to check for depending on the browser
  if ( 'sheet' in link ) {
    sheet = 'sheet'; cssRules = 'cssRules';
  }
  else {
    sheet = 'styleSheet'; cssRules = 'rules';
  }

  var interval_id = setInterval( function() {                     // start checking whether the style sheet has successfully loaded
        try {
          if ( link[sheet] && link[sheet][cssRules].length ) { // SUCCESS! our style sheet has loaded
            clearInterval( interval_id );                      // clear the counters
            fn.call( scope || window, true, link );           // fire the callback with success == true
          }
        } catch( e ) {} finally {}
      }, 100 );                                 // how long to wait before failing

  head.appendChild( link );  // insert the link node into the DOM and start loading the style sheet

  return link; // return the link node;
}