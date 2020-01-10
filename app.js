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


// communication
const wss = new ws.Server({ server });

var players = {}; var interval;
var websockets = {};
/*wss.on("connection", function(ws) {
	// TODO make id a string of chars and numbers
	// TODO randomize starting positions
	var id = Math.floor(Math.random() * Math.floor(100000)).toString();
	var p1 = new Player(id);
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
});*/
