---------------------------------
*********************************
Load Libraries and Functions
---------------------------------
function rgb2hex(rgb){
	 rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	 return "#" +
	  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
	  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
	  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2);
	}

function rgba2hex(rgb){
 rgb = rgb.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)$/);
 return "#" +
  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2);
}

 function convertRGBAndDesaturate(rgbString) {
	var hexString = rgb2hex(rgbString).split("#")[1],
		lessColor = new less.tree.Color(hexString),
		desaturatedLessColor;
	
	desaturatedLessColor = less.tree.functions.desaturate(lessColor,{"value":100});
	return desaturatedLessColor.toCSS();
 }
 
 function convertRGBAndDesaturateLessColor(rgbString) {
	var hexString = rgb2hex(rgbString).split("#")[1],
		lessColor = new less.tree.Color(hexString),
		desaturatedLessColor;
	
	desaturatedLessColor = less.tree.functions.desaturate(lessColor,{"value":100});
	return desaturatedLessColor;
 }

javascript: (function () {
	var jsCode = document.createElement('script');
    jsCode.setAttribute('type', 'text/javascript');  
    jsCode.setAttribute('src', 'http://lesscss.googlecode.com/files/less-1.3.0.min.js');  
	document.body.appendChild(jsCode);

	var jsCodeJQ = document.createElement('script');
    jsCodeJQ.setAttribute('type', 'text/javascript');  
    jsCodeJQ.setAttribute('src', 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js');  
	document.body.appendChild(jsCodeJQ);
}());

   
-------------------------------- 
TEXT
*********************************
V1 - brute force jquery
-----------------------------
$("body *").each(function(index,curLinkEl) {
	console.log($(curLinkEl));
	console.log($(curLinkEl).css("color"));
	var rgbColor = $(curLinkEl).css("color");
	var hexColor = rgbColor.indexOf("a") != -1 ? rgba2hex(rgbColor).split("#")[1] : rgb2hex(rgbColor).split("#")[1];
	var lessColor = new less.tree.Color(hexColor);
	var updatedLessColor = less.tree.functions.desaturate(lessColor, {"value":100});
	$(curLinkEl).css("color",updatedLessColor.toCSS());
	
	console.log($(curLinkEl).css("background-color"));
	var bg_rgbColor = $(curLinkEl).css("background-color");
	var bg_hexColor = bg_rgbColor.indexOf("a") != -1 ? rgba2hex(bg_rgbColor).split("#")[1] : rgb2hex(bg_rgbColor).split("#")[1];
	if(bg_hexColor != "000000") {
		var bg_lessColor = new less.tree.Color(bg_hexColor);
		var bg_updatedLessColor = less.tree.functions.desaturate(bg_lessColor, {"value":100});
		$(curLinkEl).css("color",bg_updatedLessColor.toCSS());
	}
 });
 ---------------------------
 TEXT
 *********************************
 V2 - modify css files
 ---------------------------
 //CSS Elements
    $(document.styleSheets).each(function(ssIndex,ss) {
		//var ss = document.styleSheets[0];
		$(ss.rules).each(function(index, cssRule) {
		  var cssText = cssRule.cssText;
		  var newCssText = cssText.replace(/rgb\((\d+),\s(\d+),\s(\d+)\)/g,convertRGBAndDesaturate);
		  if(cssText != newCssText) {
			ss.insertRule(newCssText,ss.rules.length);
			console.log(newCssText);
		  }
		});
	});
	
 ---------------------------
 IMG
 *********************************
 V1 - modify images with canvas
 ---------------------------
$("img").each(function(index,curImg) {
 var canvasEl = $("<canvas/>",{})[0];
 canvasEl.height = curImg.height;
 canvasEl.width = curImg.width;
 //debugger;
 var context = canvasEl.getContext("2d");
 $(curImg).after(canvasEl);

 var imageObj = new Image();
 imageObj.onload = function() {
  context.drawImage(imageObj,0,0);
  var imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height);
  var pixels = imageData.data;

  for (var i = 0, il = pixels.length; i < il; i += 4) {
	  var rgbString = "rgb("+pixels[i]+", "+pixels[i+1]+", "+pixels[i+2]+")";
	  var lessDesaturated = convertRGBAndDesaturateLessColor(rgbString);
	  pixels[i] = lessDesaturated.rgb[0];
	  pixels[i+1] = lessDesaturated.rgb[1];
	  pixels[i+2] = lessDesaturated.rgb[2];
  }

  context.putImageData(imageData, 0, 0);
 }
 imageObj.src=$(curImg).attr("src");
 $(curImg).remove();
 console.log(canvasEl);
});

 ---------------------------
 IMG
 *********************************
 V2 - modify cross domain images with canvas
 ---------------------------
$("img").each(function(index,curImg) {
 var canvasEl = $("<canvas/>",{})[0];
 canvasEl.height = curImg.height;
 canvasEl.width = curImg.width;
 var context = canvasEl.getContext("2d");
 $(curImg).after(canvasEl);
  
 $.getImageData({
	url: $(curImg).attr("src"),
	server: "http://127.0.0.1:3000/",
	success: function(image) {
		context.drawImage(image, 0, 0, canvasEl.width, canvasEl.height);
		var imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height);
		var pixels = imageData.data;

		for (var i = 0, il = pixels.length; i < il; i += 4) {
			var rgbString = "rgb("+pixels[i]+", "+pixels[i+1]+", "+pixels[i+2]+")";
			var lessDesaturated = convertRGBAndDesaturateLessColor(rgbString);
			pixels[i] = lessDesaturated.rgb[0];
			pixels[i+1] = lessDesaturated.rgb[1];
			pixels[i+2] = lessDesaturated.rgb[2];
		}
		context.putImageData(imageData, 0, 0);
		
		$(curImg).remove();
		console.log(canvasEl);
	},
	error: function(xhr, text_status) {
		debugger;
	}
 });
});

 ---------------------------
 IMG
 *********************************
 V3 - crossdomain without $.getImageData
 ---------------------------
function crossDomainImageCallback(imageInfo) {
	
}

console.log("Amount of images: " + $("img").length());
$("img").each(function(index,curImg) {
if($(curImg).attr('src').indexOf("http") != -1) { 
 var canvasEl = $("<canvas/>",{})[0];
 canvasEl.height = curImg.height;
 canvasEl.width = curImg.width;
 if(curImg.height > 5) {
	 var context = canvasEl.getContext("2d");
	 $(curImg).after(canvasEl);
	 //console.log("1: Width: " + imageInfo.width + ", Height: " + imageInfo.height);
	 //make the below call an immediately invoked function expression 
	 $.getJSON("http://127.0.0.1:3000/?callback=?",
			{"url":$(curImg).attr("src")},
			function(imageInfo) {
				//debugger;
				var image = new Image;
				image.src = imageInfo.data;
				console.log("2: Width: " + imageInfo.width + ", Height: " + imageInfo.height);
				image.onload = function() {
					console.log("3: Width: " + imageInfo.width + ", Height: " + imageInfo.height);
					context.drawImage(image, 0, 0, imageInfo.width, imageInfo.height);
					var imageData = context.getImageData(0, 0, imageInfo.width, imageInfo.height);
					var pixels = imageData.data;

					for (var i = 0, il = pixels.length; i < il; i += 4) {
						var rgbString = "rgb("+pixels[i]+", "+pixels[i+1]+", "+pixels[i+2]+")";
						var lessDesaturated = convertRGBAndDesaturateLessColor(rgbString);
						pixels[i] = lessDesaturated.rgb[0];
						pixels[i+1] = lessDesaturated.rgb[1];
						pixels[i+2] = lessDesaturated.rgb[2];
					}
					context.putImageData(imageData, 0, 0);
		
					$(curImg).remove();
					console.log(canvasEl);
				}
			});
	}
}
});

---------------------------
 IMG
 *********************************
 V4 - Combine cross domain and local images
 ---------------------------
function crossDomainImageCallback(imageInfo, canvasContext) {
	//debugger;
	var image = new Image;
	image.src = imageInfo.data;
	console.log("2: Width: " + imageInfo.width + ", Height: " + imageInfo.height);
	image.onload = function() {
		console.log("3: Width: " + imageInfo.width + ", Height: " + imageInfo.height);
		canvasContext.drawImage(image, 0, 0, imageInfo.width, imageInfo.height);
		var imageData = canvasContext.getImageData(0, 0, imageInfo.width, imageInfo.height);
		var pixels = imageData.data;

		for (var i = 0, il = pixels.length; i < il; i += 4) {
			var rgbString = "rgb("+pixels[i]+", "+pixels[i+1]+", "+pixels[i+2]+")";
			var lessDesaturated = convertRGBAndDesaturateLessColor(rgbString);
			pixels[i] = lessDesaturated.rgb[0];
			pixels[i+1] = lessDesaturated.rgb[1];
			pixels[i+2] = lessDesaturated.rgb[2];
		}
		canvasContext.putImageData(imageData, 0, 0);
	}
}

console.log("Amount of images: " + $("img").length);
$("img").each(function(index,curImg) {
if($(curImg).attr('src').indexOf("http") != -1) {
 //CROSS DOMAIN IMAGES 
 var canvasEl = $("<canvas/>",{})[0];
 canvasEl.height = curImg.height;
 canvasEl.width = curImg.width;
 if(curImg.height > 5) {
	 var context = canvasEl.getContext("2d");
	 $(curImg).after(canvasEl);
	 $.getJSON("http://127.0.0.1:3000/?callback=?",
			{"url":$(curImg).attr("src")},
			function(imageInfo) {
				//debugger;
				crossDomainImageCallback(imageInfo,context);
	 });
	}
} else {
	//LOCAL IMAGES
	var canvasEl = $("<canvas/>",{})[0];
	 canvasEl.height = curImg.height;
	 canvasEl.width = curImg.width;
	 //debugger;
	 var context = canvasEl.getContext("2d");
	 $(curImg).after(canvasEl);
	var imageObj = new Image();
	 imageObj.onload = function() {
	  context.drawImage(imageObj,0,0);
	  var imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height);
	  var pixels = imageData.data;

	  for (var i = 0, il = pixels.length; i < il; i += 4) {
		  var rgbString = "rgb("+pixels[i]+", "+pixels[i+1]+", "+pixels[i+2]+")";
		  var lessDesaturated = convertRGBAndDesaturateLessColor(rgbString);
		  pixels[i] = lessDesaturated.rgb[0];
		  pixels[i+1] = lessDesaturated.rgb[1];
		  pixels[i+2] = lessDesaturated.rgb[2];
	  }

	  context.putImageData(imageData, 0, 0);
	 }
	 imageObj.src=$(curImg).attr("src");
	 
}
$(curImg).remove();
});
