const http = require("http");
const url = require("url");
const fs = require("fs")
const ws = require("ws")

const wss = new ws.Server({noServer: true});

http.createServer(function(req, res){
	if (req.url === "/main.css") {
		fs.readFile("main.css", function(err, data){
			res.writeHead(200, {"Content-Type":"text/css"});
			res.write(data);
			res.end();
		});
	}
	else if (req.url === "/game.html") {
		fs.readFile("game.html", function(err, data){
			res.writeHead(200, {"Content-Type":"text/html"});
			res.write(data);
			res.end();
		});
	}
	else if (req.url === "/game.js") {
		fs.readFile("game.js", function(err, data){
			res.writeHead(200, {"Content-Type":"text/javascript"});
			res.write(data);
			res.end();
		});
	}
	// websocket request
	else if (req.url === "/index.js") {
		wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onConnect);
	}
	else if (req.url === "/img/player.png") {
		fs.readFile("img/player.png", function(err, data) {
			res.writeHead(200, {"Content-Type":"image/png"});
			res.write(data);
			res.end();
		});
	}
	else {
		fs.readFile("index.html", function(err, data){
			res.writeHead(200, {"Content-Type":"text/html"});
			res.write(data);
			// var q = url.parse(req.url, true).query;
			// var txt = q.arg1 + " " + q.arg2;
			// res.write("<br><br> hello <br>");
			// res.write(req.url + "<br><br>");
			// res.end(txt);
			res.end();
		});
	}
}).listen(8080);

var onConnect = function(ws) {
	ws.close(1000, "Bye!")
}
