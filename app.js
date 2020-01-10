const express = require("express");
const app = express();
const server = require("http").Server(app);

const url = require("url");
const fs = require("fs");
const ws = require("ws");

const PORT = 8080

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/client/index.html");
});
app.use("/", express.static(__dirname + "/client"));

server.listen(PORT);
console.log("Server listening on port " + PORT);

// Player
function Player(id) {
  this.id = id;
  this.rotation = Math.atan2(1, 1);
  this.x = 10;
  this.y = 10;
  this.hit = false;
  this.reload = 0;
  this.xSpeed = 0;
  this.ySpeed = 0;
	this.maxSpeed = 10;
  this.facing = 0;
};

function Game(p1, p1_websocket, game_id) {
	this.p1 = p1;
	this.p1_websocket = p1_websocket;
	this.p2 = undefined;
	this.p2_websocket = undefined;
	this.id = game_id;
	this.waiting_for_players = true;
	this.closed = 0;
}

// communication
const wss = new ws.Server({ server });

var games = {}; var interval;
// var websockets = {};
wss.on("connection", function(ws) {
	// TODO make id a string of chars and numbers
	// TODO randomize starting positions
	var id = Math.floor(Math.random() * Math.floor(100000)).toString();
	var p1 = new Player(id);
	var game_id;
	// first ever game on the server
	if (Object.entries(games).length === 0 && games.constructor === Object) {
		game_id = Math.floor(Math.random() * Math.floor(100000)).toString();
		games[game_id] = new Game(p1, ws, game_id);
	}
	else {
		for (var game in games) {
			// any game waits for players
			if (games[game].waiting_for_players) {
				games[game].p2 = p1;
				games[game].p2_websocket = ws;
				games[game].waiting_for_players = false;
				game_id = game;
				games[game_id].p1_websocket.send(JSON.stringify(["init", {player: games[game_id].p1, enemy: games[game_id].p2}]));
				games[game_id].p2_websocket.send(JSON.stringify(["init", {player: games[game_id].p2, enemy: games[game_id].p1}]));
				break;
			}
		}
		// no game waits for players :(
		if (game_id === undefined) {
			game_id = Math.floor(Math.random() * Math.floor(100000)).toString();
			games[game_id] = new Game(p1, ws, game_id);
		}
	}

	ws.on("message", function(message) {
		if (JSON.parse(message)[0] === "key_press") {
			if (JSON.parse(message)[1] === "up")
				p1.ySpeed = -p1.maxSpeed;
			if (JSON.parse(message)[1] === "down")
				p1.ySpeed = p1.maxSpeed;
			if (JSON.parse(message)[1] === "left")
				p1.xSpeed = -p1.maxSpeed;
			if (JSON.parse(message)[1] === "right")
				p1.xSpeed = p1.maxSpeed;
		}
		else if (JSON.parse(message)[0] === "key_up") {
			if (JSON.parse(message)[1] === "up") {
				p1.ySpeed = 0;
				// so that the client will know to stop displaying the tracks
				games[game_id].p1_websocket.send(JSON.stringify(["move", {x:p1.x, y: p1.y, id: p1.id, xSpeed: p1.xSpeed, ySpeed: p1.ySpeed}]));
				games[game_id].p2_websocket.send(JSON.stringify(["move", {x:p1.x, y: p1.y, id: p1.id, xSpeed: p1.xSpeed, ySpeed: p1.ySpeed}]));
			}
			if (JSON.parse(message)[1] === "down") {
				p1.ySpeed = 0;
				games[game_id].p1_websocket.send(JSON.stringify(["move", {x:p1.x, y: p1.y, id: p1.id, xSpeed: p1.xSpeed, ySpeed: p1.ySpeed}]));
				games[game_id].p2_websocket.send(JSON.stringify(["move", {x:p1.x, y: p1.y, id: p1.id, xSpeed: p1.xSpeed, ySpeed: p1.ySpeed}]));
			}
			if (JSON.parse(message)[1] === "left") {
				p1.xSpeed = 0;
				games[game_id].p1_websocket.send(JSON.stringify(["move", {x:p1.x, y: p1.y, id: p1.id, xSpeed: p1.xSpeed, ySpeed: p1.ySpeed}]));
				games[game_id].p2_websocket.send(JSON.stringify(["move", {x:p1.x, y: p1.y, id: p1.id, xSpeed: p1.xSpeed, ySpeed: p1.ySpeed}]));
			}
			if (JSON.parse(message)[1] === "right") {
				p1.xSpeed = 0;
				games[game_id].p1_websocket.send(JSON.stringify(["move", {x:p1.x, y: p1.y, id: p1.id, xSpeed: p1.xSpeed, ySpeed: p1.ySpeed}]));
				games[game_id].p2_websocket.send(JSON.stringify(["move", {x:p1.x, y: p1.y, id: p1.id, xSpeed: p1.xSpeed, ySpeed: p1.ySpeed}]));
			}
		}
	});
	var interval = setInterval(function() {
		// if (p.pressingUp || p.pressingDown || p.pressingLeft || p.pressingRight) {
		// 	p.updatePosition();
		// 	for (websock in websockets) {
		// 		websockets[websock].send(JSON.stringify(["move", {player: p }]));
		// 	}
		// }
		if (p1.ySpeed === 0) {
	    p1.x = p1.x + p1.xSpeed * 2 / 6;
	  } else {
	    p1.x = p1.x + p1.xSpeed * Math.sqrt(50) / 30;
	  }
	  if (p1.xSpeed === 0) {
	    p1.y = p1.y + p1.ySpeed * 2 / 6;
	  } else {
	    p1.y = p1.y + p1.ySpeed * Math.sqrt(50) / 30;
	  }

		if ((p1.ySpeed !== 0 || p1.xSpeed !== 0)) {
			games[game_id].p1_websocket.send(JSON.stringify(["move", {x:p1.x, y: p1.y, id: p1.id, xSpeed: p1.xSpeed, ySpeed: p1.ySpeed}]));
			games[game_id].p2_websocket.send(JSON.stringify(["move", {x:p1.x, y: p1.y, id: p1.id, xSpeed: p1.xSpeed, ySpeed: p1.ySpeed}]));
		}
	}, 25);
	ws.on("close", () => {
		console.log("connection closed");
		games[game_id].p1_websocket.close();
		games[game_id].p2_websocket.close();
		games[game_id].closed++;
		console.log("game set to be closed");
		console.log("clearing the interval\n")
		clearInterval(interval);
		console.log("_________________________________\n")
	});
});

setInterval(() => {
	for (game in games) {
		if (games[game].closed >= 2) {
			delete games[game];
			console.log("deleted the game associated with id " + game);
		}
	}
}, 5000);
