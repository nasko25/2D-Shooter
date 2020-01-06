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
	else if (req.url === "/img/map.png") {
		fs.readFile("img/map.png", function(err, data) {
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

// player
Player = function() {
	var self = {
    speed_x: 0,
    speed_y: 0,
    max_speed: 10,
    id: "",
    map_x: 0,
    map_y: 0,
    pressingLeft: false,
    pressingRight: false,
    pressingUp: false,
    pressingDown: false,
    is_hit: false
  };
  self.x = WIDTH/2 - self.image.width/2;
  self.y = HEIGHT/2 - self.image.height/2;
	return self;
}


// communication
const wss = new ws.Server({ server });

/* TODO clean unused websockets ! */
var websockets = {};

wss.on("connection", function(ws) {
	ws.on("message", function(message) {
		console.log("Type of message: " + JSON.parse(message)[0] + "\n" + "Message object: ", JSON.parse(message)[1]);
	});
	msg = ["init", {id:"0123", name:"asd"}];
	ws.send(JSON.stringify(msg));
});
