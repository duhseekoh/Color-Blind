//Listen for an image source to be passed in and then respond with it in base64 form.
//This bypasses the security restriction placed on content scripts since they still
//adhere to the cross domain constraints that regular in page javascript does.
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
//    debugger;
    var img = new Image();
    img.onload = function() {
      var canvas = document.createElement("canvas");
      var context = canvas.getContext("2d");
      context.drawImage(img, 0, 0);
      sendResponse({dataUrl: canvas.toDataURL()});
    };
    img.src = request.imageSrc;
    return true;
  }
);