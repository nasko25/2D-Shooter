var http = require("http");
var url = require("url");
var fs = require("fs")

http.createServer(function(req, res){

	if (req.url === "/main.css") {
		fs.readFile("main.css", function(err, data){
			res.writeHead(200, {"Content-Type":"text/css"});
			res.write(data);
			res.end();
		});
	}

	else {
		fs.readFile("index.html", function(err, data){
			res.writeHead(200, {"Content-Type":"text/html"});
			res.write(data);
			var q = url.parse(req.url, true).query;
			var txt = q.arg1 + " " + q.arg2;
			res.write("<br><br> hello <br>");
			res.write(req.url + "<br><br>");
			res.end(txt);
		});
	}
}).listen(8080);
