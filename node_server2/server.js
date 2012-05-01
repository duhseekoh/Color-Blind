// Include dependencies
var express = require('express'),
request = require('request'),
http = require('http'),
fs = require('fs'),
sys = require('sys');

var app = express.createServer(
	express.logger()
);

app.get('/', function(req, res){
	
	// If a URL and callback parameters are present 
	if(req.param("url") && req.param("callback")) {
		
		// Get the parameters
		var url = unescape(req.param("url")),
		callback = req.param("callback");
		
		request({ uri:url, encoding: 'binary'}, function (error, response, body) {
			// If the request was OK
			if (!error && response.statusCode == 200) {
				
				// Check if the mimetype says it is an image
				var mimetype = response.headers["content-type"];
				if(mimetype == "image/gif" || mimetype == "image/jpeg" || 
				   mimetype == "image/jpg" || mimetype == "image/png" || 
				   mimetype == "image/tiff") {
					
					// Create the prefix for the data URL
					var type_prefix = "data:" + mimetype + ";base64,";
					
					// Get the image from the response stream as a string and convert it to base64
					var image_buffer = new Buffer(body.toString(),"binary");
					var image_64 = image_buffer.toString('base64'); 

					// Concat the prefix and the image
					image_64 = type_prefix + image_64;

					console.log("image_64*********" + image_64);

					// The data to be returned 
					var return_variable = {
							"data": image_64
					};

					// Stringifiy the return variable and wrap it in the callback for JSONP compatibility
					return_variable = callback + "(" + JSON.stringify(return_variable) + ");";

					// Set the headers as OK and JS
					res.writeHead(200, {'Content-Type': 'application/javascript; charset=UTF-8'});

					// Return the data
					res.end(return_variable);
					
					
				// File type was not a supported image
				} else res.send("This file type is not supported", 400);
				
			// Error getting the image
			} else res.send("Third-party server error", response.statusCode);
			
		});
		
	// Missing parameters	
	} else res.send("No URL or no callback was specified. These are required", 400);
	
});

// Handle 404 and 500 errors
app.get('/404', function(req, res){
	throw new Error('Page not found');
});
app.get('/500', function(req, res){
	throw new Error('Server error');
});

// Run the server on port 3000
app.listen(3000);