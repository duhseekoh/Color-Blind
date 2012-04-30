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
console.log("TOTAL RULES: " + totalRules);

var rulesProcessed = 0;
$(document.styleSheets).each(function(ssIndex,ss) {
//var ss = document.styleSheets[0];
$(ss.rules).each(function(index, cssRule) {
  var cssText = cssRule.cssText;
 if(cssText.indexOf("background:") !== -1) {
	console.log("BG: " + cssText);
}
 if(cssText.indexOf("background-image: url") !== -1) {  
 	//var cssBGImage = cssText.match( /background-image: url\([^)]+\);/ );
	var cssBGImageMatch = cssText.match( /background-image: url\(([^)]+)\);/ );
	if(!cssBGImageMatch || cssBGImageMatch.length < 2) {
		return false;
	}
	var cssBGImage = cssBGImageMatch[1];
	
	$.getJSON("http://127.0.0.1:3000/?callback=?",
				{"url":cssBGImage},
				function(imageInfo) {
					console.log(cssBGImage);
					//console.log(imageInfo);
					debugger;
					var newCSSText = cssText.replace(/background-image: url\(([^)]+)\);/
							,"background-image: url(\""+imageInfo.data+"\");");
					ss.insertRule(newCSSText,ss.rules.length);
					//console.log(newCSSText);
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
console.log("RULES PROCESSED: " + rulesProcessed);