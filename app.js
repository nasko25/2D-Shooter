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
  this.facing = 0;
};

function Game(p1, p1_websocket, game_id) {
	this.p1 = p1;
	this.p1_websocket = p1_websocket;
	this.p2 = undefined;
	this.p2_websocket = undefined;
	this.id = game_id;
	this.waiting_for_players = true;
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
		games[game_id] = new Game(p1, ws, id);
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
			}
		}
		// no game waits for players :(
		if (game_id === undefined) {
			game_id = Math.floor(Math.random() * Math.floor(100000)).toString();
			games[game_id] = new Game(p1, ws, id);
		}
	}

	// ws.on("message", function(message) {
	// 	if (JSON.parse(message)[0] === "key_press") {
	// 		if (JSON.parse(message)[1].pressingUp !== undefined)
	// 			p.pressingUp = JSON.parse(message)[1].pressingUp;
	// 		if (JSON.parse(message)[1].pressingDown !== undefined)
	// 			p.pressingDown = JSON.parse(message)[1].pressingDown;
	// 		if (JSON.parse(message)[1].pressingLeft !== undefined)
	// 			p.pressingLeft = JSON.parse(message)[1].pressingLeft;
	// 		if (JSON.parse(message)[1].pressingRight !== undefined)
	// 			p.pressingRight = JSON.parse(message)[1].pressingRight;
	// 	}
	// });
	interval = setInterval(() => {
		// if (p.pressingUp || p.pressingDown || p.pressingLeft || p.pressingRight) {
		// 	p.updatePosition();
		// 	for (websock in websockets) {
		// 		websockets[websock].send(JSON.stringify(["move", {player: p }]));
		// 	}
		// }
	}, 25);

	ws.on("close", () => {
		console.log("connection closed");
		delete games[game_id];
		console.log("deleted the game associated with id " + game_id);
		console.log("clearing the interval\n")
		clearInterval(interval);
		console.log("_________________________________\n")
	});
});
