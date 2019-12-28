require("./Player.js")
const http = require("http");
const url = require("url");
const fs = require("fs");
const ws = require("ws");

var server = http.createServer(function(req, res){
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

const wss = new ws.Server({ server });

/* TODO clean unused websockets ! */
var websockets = {};

wss.on("connection", function(ws) {
	ws.on("message", function(message) {
		console.log(message);
	});
	ws.send("...data sent through a web socket...");
});
