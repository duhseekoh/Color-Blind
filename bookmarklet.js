//*************COLOR FUNCTIONS
function rgb2hex(rgb) {
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  return "#" +
      ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2);
}

function rgba2hex(rgb) {
  rgb = rgb.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)$/);
  return "#" +
      ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2);
}

function convertRGBAndDesaturate(rgbString) {
  var hexString = rgb2hex(rgbString).split("#")[1],
      lessColor = new less.tree.Color(hexString),
      desaturatedLessColor;

  desaturatedLessColor = less.tree.functions.desaturate(lessColor, {"value":100});
  return desaturatedLessColor.toCSS();
}

function convertRGBAndDesaturateLessColor(rgbString) {
  var hexString = rgb2hex(rgbString).split("#")[1],
      lessColor = new less.tree.Color(hexString),
      desaturatedLessColor;

  desaturatedLessColor = less.tree.functions.desaturate(lessColor, {"value":100});
  return desaturatedLessColor;
}
//*************END COLOR FUNCTIONS

//*************PROCESSING FUNCTIONS
function crossDomainImageCallback(imageInfo, canvasContext) {
  debugger;
  var image = new Image();
  image.src = imageInfo.data;
  console.log("2: Width: " + image.width + ", Height: " + image.height);
  image.onload = function () {
    console.log("3: Width: " + image.width + ", Height: " + image.height);
    canvasContext.drawImage(image, 0, 0, image.width, image.height);
    var imageData = canvasContext.getImageData(0, 0, image.width, image.height);
    var pixels = imageData.data;

    for (var i = 0, il = pixels.length; i < il; i += 4) {
      var rgbString = "rgb(" + pixels[i] + ", " + pixels[i + 1] + ", " + pixels[i + 2] + ")";
      var lessDesaturated = convertRGBAndDesaturateLessColor(rgbString);
      pixels[i] = lessDesaturated.rgb[0];
      pixels[i + 1] = lessDesaturated.rgb[1];
      pixels[i + 2] = lessDesaturated.rgb[2];
    }
    debugger;
    canvasContext.putImageData(imageData, 0, 0);
  };
}

//IMAGES
function processImages() {
  console.log("Amount of images: " + jQuery("img").length);
  var canvasEl, context;
  jQuery("img").each(function (index, curImg) {
    if (jQuery(curImg).attr('src') && jQuery(curImg).attr('src').indexOf("http") !== -1) {
      //CROSS DOMAIN IMAGES
      canvasEl = jQuery("<canvas/>", {})[0];
      canvasEl.height = curImg.height;
      canvasEl.width = curImg.width;
      if (curImg.height > 5) {
        context = canvasEl.getContext("2d");
        jQuery(curImg).after(canvasEl);
        jQuery.getJSON("http://127.0.0.1:3000/?callback=?",
            {"url":jQuery(curImg).attr("src")},
            function (imageInfo) {
              //debugger;
              crossDomainImageCallback(imageInfo, context);
            });
      }
    } else {
      //LOCAL IMAGES
      canvasEl = jQuery("<canvas/>", {})[0];
      canvasEl.height = curImg.height;
      canvasEl.width = curImg.width;
      //debugger;
      context = canvasEl.getContext("2d");
      jQuery(curImg).after(canvasEl);
      var imageObj = new Image();
      imageObj.onload = function () {
        context.drawImage(imageObj, 0, 0);
        var imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height);
        var pixels = imageData.data;

        for (var i = 0, il = pixels.length; i < il; i += 4) {
          var rgbString = "rgb(" + pixels[i] + ", " + pixels[i + 1] + ", " + pixels[i + 2] + ")";
          var lessDesaturated = convertRGBAndDesaturateLessColor(rgbString);
          pixels[i] = lessDesaturated.rgb[0];
          pixels[i + 1] = lessDesaturated.rgb[1];
          pixels[i + 2] = lessDesaturated.rgb[2];
        }

        context.putImageData(imageData, 0, 0);
      };
      imageObj.src = jQuery(curImg).attr("src");

    }
    jQuery(curImg).remove();
  });
}

//CSS FILES
function processCSS() {
  console.log("Processing CSS");
  console.log("Total Stylesheets: " + document.styleSheets.length);
  jQuery(document.styleSheets).each(function (ssIndex, ss) {
    if (!ss.rules) { return; }
    console.log("Stylesheet " + ssIndex + " has " + ss.rules.length + " CSS rules defined");
    jQuery(ss.rules).each(function (index, cssRule) {
      var cssText = cssRule.cssText;
      var newCssText = cssText.replace(/rgb\((\d+),\s(\d+),\s(\d+)\)/g, convertRGBAndDesaturate);
      if (cssText !== newCssText) {
        ss.insertRule(newCssText, ss.rules.length);
        //console.log(newCssText);
      }
    });
  });
  console.log("Done Processing CSS");
}

//CSS BACKGROUND IMAGES
//TODO: Get a list of all the different images with each cssRule, then loop over those
//and make the ajax calls, so the same image is only processed once.
function processCSSImages() {
  var totalRules = 0, imagesBeingRequested = [], deferredImageRequests = [];
  jQuery(document.styleSheets).each(function (ssIndex, ss) {
    jQuery(ss.rules).each(function (index, cssRule) {
      if (cssRule.cssText && cssRule.cssText.indexOf("background-image: url") !== -1) {
        totalRules++;
      }
    });
  });
  console.log("TOTAL RULES WITH BG IMAGE: " + totalRules);

  var rulesProcessed = 0, rulesProcessedWithBG = 0;
  jQuery(document.styleSheets).each(function (ssIndex, ss) {
    jQuery(ss.rules).each(function (index, cssRule) {
      var cssText = cssRule.cssText;
      if (cssRule.cssText && cssText.indexOf("background:") !== -1) {
        console.log("BG: " + cssText);
      }
      if (cssRule.cssText && cssText.indexOf("background-image: url") !== -1) {
        //Reasons to ignore this entry in the stylesheet
        //malformed css declaration
        var bracketIndex = cssText.indexOf("{");
        if (bracketIndex === -1) {
          return true; //
        }
        //this selector doesn't exist in the current page
        var cssSelector = cssText.substring(0, bracketIndex);
        if (jQuery(cssSelector).length === 0) {
          return true;
        }
        //this selector doesn't exist in the current page
        var cssBGImageMatch = cssText.match(/background-image: url\(([^)]+)\);/);
        if (!cssBGImageMatch || cssBGImageMatch.length < 2) {
          return true;
        }

        //css selector found something on the page and the definition has a background image
        var cssBGImage = cssBGImageMatch[1];
        //is this image already being requested? if so, lets just hook the callback up for

        jQuery.getJSON("http://127.0.0.1:3000/?callback=?",
            {"url":cssBGImage},
            function (imageInfo) {
              console.log("URL: " + cssBGImage);
              console.log("DATA: ");
              console.log(imageInfo);
              var canvasEl = jQuery('<canvas/>');
              var context = canvasEl[0].getContext("2d");
              var imageObj = new Image();
              imageObj.onload = function () {
                debugger;
                jQuery(canvasEl).attr("width", this.width);
                jQuery(canvasEl).attr("height", this.height);
                context.drawImage(imageObj, 0, 0);
                var imageData = context.getImageData(0, 0, this.width, this.height);
                console.log("W/H: " + this.width + " / " + this.height);
                var pixels = imageData.data;

                for (var i = 0, il = pixels.length; i < il; i += 4) {
                  var rgbString = "rgb(" + pixels[i] + ", " + pixels[i + 1] + ", " + pixels[i + 2] + ")";
                  var lessDesaturated = convertRGBAndDesaturateLessColor(rgbString);
                  pixels[i] = lessDesaturated.rgb[0];
                  pixels[i + 1] = lessDesaturated.rgb[1];
                  pixels[i + 2] = lessDesaturated.rgb[2];
                }
                //set the canvas dimensions before putting the image data in so the size matches up
                jQuery(canvasEl).attr("width", this.width);
                jQuery(canvasEl).attr("height", this.height);
                context.putImageData(imageData, 0, 0, 0, 0, this.width, this.height);
                //get the data url and
                var dataUrl = canvasEl[0].toDataURL();
                var newCSSText = cssText.replace(/background-image: url\(([^)]+)\);/, "background-image: url(\"" + dataUrl + "\");");
                ss.insertRule(newCSSText, ss.rules.length);
              };
              //pump the base64 image into the canvas img
              imageObj.src = imageInfo.data;

              debugger;

              //console.log(newCSSText);
            }).error(function () {
              console.log("error");
            });

        //REGEX Explanation:
        //match a string starting with "background-image: url(".
        //the next paran denotes the start of the backreference that we want to start extracting the insides to save the url
        //inside the square brackets gives us any character up to the next closing paren which is the end of the url
        //the backreference is then closed
        //the regex is stopped at the closing ");"
        //console.log(cssText.match( /background-image: url\(([^)]+)\);/ ));

        rulesProcessed++;
      }
    });
  });
  console.log("RULES PROCESSED WITH BG IMAGE: " + rulesProcessed);
}

function processCSSImagesDeferred() {
  var totalRules = 0, cssWithBGImageMatchArray = [], styleSheetsProcessed = 0;
  jQuery(document.styleSheets).each(function (ssIndex, ss) {
    jQuery(ss.rules).each(function (index, cssRule) {
      var cssText = cssRule.cssText;
      if (cssRule.cssText && cssText.indexOf("background:") !== -1) {
        //console.log(ssIndex + "BG: " + cssText);
      }
      if (cssRule.cssText && cssText.indexOf("background-image: url") !== -1) {
        console.log(ssIndex + " BG Image: " + cssText);
        //Reasons to ignore this entry in the stylesheet
        //malformed css declaration
        var bracketIndex = cssText.indexOf("{");
        if (bracketIndex === -1) {
          return true; //
        }
        //this selector doesn't exist in the current page
        var cssSelectors = cssText.substring(0, bracketIndex).split(","), foundAny = false;
        jQuery.each(cssSelectors, function(index, cssSelector) {
          if (jQuery(cssSelector.trim()).length > 0) {
            foundAny = true;
            return false;
          }
        });
        if (!foundAny) {
          return true;
        }
        //this selector doesn't exist in the current page
        var cssBGImageMatch = cssText.match(/background-image: url\(([^)]+)\);/);
        if (!cssBGImageMatch || cssBGImageMatch.length < 2) {
          return true;
        }

        //css selector found something on the page and the definition has a background image
        var cssBGImage = cssBGImageMatch[1];
        console.log(cssText);
        var found = false;
        jQuery(cssWithBGImageMatchArray).each(function (index, matchObj) {
          if (matchObj.cssBGImage === cssBGImage) {
            matchObj.cssTexts.push(cssText);
            found = true;
            return false;
          }
        });
        //image is not already in the array, so creating a new entry for it
        if (!found) {
          var cssWithBGImageMatch = {
            cssTexts:[cssText],
            cssBGImage:cssBGImage
          };
          cssWithBGImageMatchArray.push(cssWithBGImageMatch);
        }


      }
    });
    styleSheetsProcessed++;
  });
  console.log("SS Processed: " + styleSheetsProcessed);
  console.log(cssWithBGImageMatchArray);
  debugger;
  jQuery(cssWithBGImageMatchArray).each(function (index, matchObj) {

    jQuery.getJSON("http://127.0.0.1:3000/?callback=?",
        {"url":matchObj.cssBGImage},
        function (imageInfo) {
          console.log("URL: " + matchObj.cssBGImage);
          console.log("DATA: ");
          console.log(imageInfo);
          var canvasEl = jQuery('<canvas/>');
          var context = canvasEl[0].getContext("2d");
          var imageObj = new Image();
          imageObj.onload = function () {
            jQuery(canvasEl).attr("width", this.width);
            jQuery(canvasEl).attr("height", this.height);
            context.drawImage(imageObj, 0, 0);
            var imageData = context.getImageData(0, 0, this.width, this.height);
            console.log("W/H: " + this.width + " / " + this.height);
            var pixels = imageData.data;

            for (var i = 0, il = pixels.length; i < il; i += 4) {
              var rgbString = "rgb(" + pixels[i] + ", " + pixels[i + 1] + ", " + pixels[i + 2] + ")";
              var lessDesaturated = convertRGBAndDesaturateLessColor(rgbString);
              pixels[i] = lessDesaturated.rgb[0];
              pixels[i + 1] = lessDesaturated.rgb[1];
              pixels[i + 2] = lessDesaturated.rgb[2];
            }
            //set the canvas dimensions before putting the image data in so the size matches up
            jQuery(canvasEl).attr("width", this.width);
            jQuery(canvasEl).attr("height", this.height);
            context.putImageData(imageData, 0, 0, 0, 0, this.width, this.height);
            //get the data url and
            var dataUrl = canvasEl[0].toDataURL();

            //go through the css rules that have this image, replace the image, and insert the new rule
            jQuery.each(matchObj.cssTexts, function (jindex, cssText) {
              var newCSSText = cssText.replace(/background-image: url\(([^)]+)\);/, "background-image: url(\"" + dataUrl + "\");");
              //console.log("Inserting newCSSText", newCSSText);
              document.styleSheets[document.styleSheets.length-2].insertRule(newCSSText, document.styleSheets[document.styleSheets.length-2].rules.length);
            });
          };
          //pump the base64 image into the canvas img, onload above will trigger when the data is inserted
          imageObj.src = imageInfo.data;
        }).error(function () {
          console.log("error");
        });

    //REGEX Explanation:
    //match a string starting with "background-image: url(".
    //the next paran denotes the start of the backreference that we want to start extracting the insides to save the url
    //inside the square brackets gives us any character up to the next closing paren which is the end of the url
    //the backreference is then closed
    //the regex is stopped at the closing ");"
    //console.log(cssText.match( /background-image: url\(([^)]+)\);/ ));
  });
}
//*************END PROCESSING FUNCTIONS

function loadScript(url, callback) {

  var script = document.createElement("script");
  script.type = "text/javascript";

  if (script.readyState) {  //IE
    script.onreadystatechange = function () {
      if (script.readyState === "loaded" ||
          script.readyState === "complete") {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else {  //Others
    script.onload = function () {
      callback();
    };
  }

  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
}

function startProcessing() {
  jQuery('iframe, embed').remove();

  console.log("--------------");
  //processCSS();
  console.log("--------------");
  //processImages();
  console.log("--------------");
  //processCSSImages();
  console.log("--------------");
  processCSSImagesDeferred();
}

javascript: (function () {
  debugger;
  var lessLoaded = false, jqueryLoaded = false;

  //LESS
  loadScript('http://lesscss.googlecode.com/files/less-1.3.0.min.js', function () {
    debugger;
    lessLoaded = true;
    if (jqueryLoaded) {
      console.log("LESS and jquery loaded");
      jQuery(function () {
        debugger;
        startProcessing();
      });
    }
  });

  //JQUERY
  loadScript('https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js', function () {
    debugger;
    jqueryLoaded = true;
    if (lessLoaded) {
      console.log("less and JQUERY loaded");
      jQuery(function () {
        debugger;
        startProcessing();
      });
    }
  });
}());