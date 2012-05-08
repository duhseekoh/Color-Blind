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

//-----------------------V1
var totalRules = 0;
$(document.styleSheets).each(function(ssIndex,ss) {
	$(ss.rules).each(function(index, cssRule) {
		if(cssRule.cssText.indexOf("background-image: url") !== -1) {
			totalRules++;
		}
	});
});
console.log("TOTAL RULES WITH BG IMAGE: " + totalRules);

//put a div to put the images in
//var bgHolder = $('<ol id="bgHelper"></ol>');
//$('body').append(bgHolder);

var rulesProcessed = 0, rulesProcessedWithBG = 0;
$(document.styleSheets).each(function(ssIndex,ss) {
$(ss.rules).each(function(index, cssRule) {
  var cssText = cssRule.cssText;
 if(cssText.indexOf("background:") !== -1) {
	console.log("BG: " + cssText);
}
 if(cssText.indexOf("background-image: url") !== -1) {  
	var cssBGImageMatch = cssText.match( /background-image: url\(([^)]+)\);/ );
	if(!cssBGImageMatch || cssBGImageMatch.length < 2) {
		return true;
	}
	var cssBGImage = cssBGImageMatch[1];
	
	$.getJSON("http://127.0.0.1:3000/?callback=?",
				{"url":cssBGImage},
				function(imageInfo) {
					console.log("URL: " + cssBGImage);
					console.log("DATA: ");
					console.log(imageInfo);
					//add data elements to bgHolder
					//var bgLi = $('<li></li>');
					//$(bgLi).attr("")
					var canvasEl = $('<canvas/>');
					var context = canvasEl[0].getContext("2d");
					var imageObj = new Image();
					 imageObj.onload = function() {
						debugger;
					  context.drawImage(imageObj,0,0);
					  var imageData = context.getImageData(0, 0, this.width, this.height);
					  console.log("W/H: " + this.width + " / " + this.height);
					  var pixels = imageData.data;

					  for (var i = 0, il = pixels.length; i < il; i += 4) {
						  var rgbString = "rgb("+pixels[i]+", "+pixels[i+1]+", "+pixels[i+2]+")";
						  var lessDesaturated = convertRGBAndDesaturateLessColor(rgbString);
						  pixels[i] = lessDesaturated.rgb[0];
						  pixels[i+1] = lessDesaturated.rgb[1];
						  pixels[i+2] = lessDesaturated.rgb[2];
					  }
					  context.putImageData(imageData, 0, 0, 0, 0, this.width, this.height);
					
						$(canvasEl).attr("width",this.width);
						$(canvasEl).attr("height",this.height);
					  var dataUrl = canvasEl[0].toDataURL();
						var newCSSText = cssText.replace(/background-image: url\(([^)]+)\);/
								,"background-image: url(\""+dataUrl+"\");");
						ss.insertRule(newCSSText,ss.rules.length);
					 }
					//pump the base64 image into the canvas img
					imageObj.src = imageInfo.data;
					
					debugger;
					
					//console.log(newCSSText);
		 }).error(function() {
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