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
var prev_x = 0;
var prev_y = 0;
Player = function() {
	var self = {
		x: 0,
		y: 0,
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

	self.updatePosition = function() {
    // TODO rotate the image!

    // change the offset for the map
    if (self.pressingLeft)
      self.speed_x = self.max_speed;
    if (self.pressingRight)
      self.speed_x = -self.max_speed;
    if (self.pressingUp)
      self.speed_y = self.max_speed;
    if (self.pressingDown)
      self.speed_y = -self.max_speed;

    if (!self.pressingLeft && !self.pressingRight) {
      self.speed_x = 0;
    }
    if (!self.pressingUp && !self.pressingDown) {
      self.speed_y = 0;
    }

    if (Math.abs(self.speed_x) !== Math.abs(self.speed_y)) {
        self.x += self.speed_x;
        self.y += self.speed_y;
    }
    else {
        self.x += self.speed_x*Math.sqrt(3)/2;
        self.y += self.speed_y*Math.sqrt(3)/2;
    }

		// if (prev_x !== self.x || prev_y !== self.y)
		// 	ws.send(["move", {x: self.x, y: self.y}]);
		// prev_x = self.x;
		// prev_y = self.y;
  }

	self.draw = function(canvas) {
		canvas.drawImage(self.image, self.x, self.y);
	}

	return self;
}


// communication
const wss = new ws.Server({ server });

var players = {}; var interval;
var websockets = {};
wss.on("connection", function(ws) {
	// TODO make id a string of chars and numbers
	// TODO randomize starting positions 
	var id = Math.floor(Math.random() * Math.floor(100000)).toString();
	var p = Player();
	players[id] = p;
	websockets[id] = ws;
	p.id = id;
	for (websock in websockets) {
		websockets[websock].send(JSON.stringify(["init", {player: p, other_players: players}]));
	}

	ws.on("message", function(message) {
		if (JSON.parse(message)[0] === "key_press") {
			if (JSON.parse(message)[1].pressingUp !== undefined)
				p.pressingUp = JSON.parse(message)[1].pressingUp;
			if (JSON.parse(message)[1].pressingDown !== undefined)
				p.pressingDown = JSON.parse(message)[1].pressingDown;
			if (JSON.parse(message)[1].pressingLeft !== undefined)
				p.pressingLeft = JSON.parse(message)[1].pressingLeft;
			if (JSON.parse(message)[1].pressingRight !== undefined)
				p.pressingRight = JSON.parse(message)[1].pressingRight;
		}
	});
	interval = setInterval(() => {
		// for (var id in players) {
		// 	if (players[id].pressingUp || players[id].pressingDown || players[id].pressingLeft || players[id].pressingRight) {
    //     players[id].updatePosition();
		// 		ws.send(JSON.stringify(["move", {player:players[id]}]));
		// 	}
		// }
		if (p.pressingUp || p.pressingDown || p.pressingLeft || p.pressingRight) {
			p.updatePosition();
			for (websock in websockets) {
				websockets[websock].send(JSON.stringify(["move", {player: p }]));
			}
		}
	}, 40);

	ws.on("close", () => {
		console.log("connection closed");
		delete players[id];
		delete websockets[id];
		console.log("deleted the socket associated with id " + id);
		console.log("clearing the interval\n")
		console.log("_________________________________\n")
		clearInterval(interval);
	});
});
