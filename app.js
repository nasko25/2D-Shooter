const express = require("express");
const app = express();
const server = require("http").Server(app);

const url = require("url");
const fs = require("fs");
const ws = require("ws");

const cook_parse = require("cookie-parser")

var bodyParser = require('body-parser');

const mongo = require("mongodb").MongoClient;

const config = require("config");
var database = config.get("Game.dbConfig")

const PORT = 8080

app.use(cook_parse());

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: false }));

// set cookies
// app.use((req, res, next) => {
//   var cookie = req.cookies.times_accessed;
//   if (cookie === undefined) {
//     res.cookie("times_accessed", 0);
//   }
//   else if (req.originalUrl === "/"){
//     cookie = parseInt(cookie)+1;
//     console.log(req.originalUrl)
//     res.cookie("times_accessed", cookie);
//   }
//   next();
// });

app.set('views', __dirname + "/client");
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  // res.sendFile(__dirname + "/client/index.html");
  var cookie = req.cookies.times_accessed;
  res.render("index", {
    games_played: cookie
  });
});
app.get("/game.html", (req, res) => {
  var cookie = req.cookies.times_accessed;
  if (cookie === undefined)
    res.cookie("times_accessed", 0);
  else if (req.originalUrl === "/game.html")
    res.cookie("times_accessed", parseInt(cookie) + 1);
  res.sendFile(__dirname + "/client/game.html");
});
app.use("/", express.static(__dirname + "/client"));

app.post('/winner', function (req, res) {
  if (winners.length !== 0) {
    // TODO add to the database
    var name = req.body[0]; // can be null!
    var p_id = req.body[1];
    // name === null;
    mongo.connect("mongodb://" + database.user + ":" + database.pass + "@" + database.host + ":" + database.port + "/" + database.dbName, {
      useUnifiedTopology: true
    }, (err, db) => {
      if (err) throw err;
      db.db("game").collection("recent_wins").insertOne({name: ((name === null) ? "anonymous" : name), time: new Date()}, (err, res) => {
        if (err) throw err;
        //db.close();
      });
      db.db("game").collection("recent_wins").find().count((err, res) => {
        if (res > 7) {
          db.db("game").collection("recent_wins").find().sort({time: 1}).toArray((err, result)=>{
            var id = result[0]["_id"];
            db.db("game").collection("recent_wins").deleteOne({_id: id});
          });
        }
        //db.close();
      });
      var game_id;
      winners.forEach((element, index, object)=>{
        if (element.player === p_id) {
          game_id = element.game_id;
          object.splice(index, 1);
        }
      })
      db.db("game").collection("recent_games").insertOne({game_id: ((game_id === undefined || game_id === null || game_id === -1) ? "none" : game_id), winner: ((name === null) ? "anonymous" : name)}, (err, res) => {
        if (err) throw err;
        //db.close();
      });
    });
  }
  return res.end('done');
})

server.listen(PORT);
console.log("Server listening on port " + PORT);

// Player
function Player(id) {
  this.id = id;
  this.rotation = Math.atan2(1, 1);
  this.x = Math.floor((Math.random() * 500) + 1000);
  this.y = Math.floor((Math.random() * 500) + 1000);
  this.hit = false;
  this.reload = 0;
  this.xSpeed = 0;
  this.respawn = 0;
  this.dead = false;
  this.ySpeed = 0;
  this.killCount = 0;
  this.maxSpeed = 10;
  this.facing = 0;
  this.face = function() {
    if (this.ySpeed > 0 && this.xSpeed > 0) {
      this.facing = Math.PI * 1 / 4;
    } else if (this.ySpeed > 0 && this.xSpeed < 0) {
      this.facing = Math.PI * 3 / 4;
    } else if (this.ySpeed > 0) {
      this.facing = Math.PI / 2;
    } else if (this.xSpeed > 0 && this.ySpeed === 0) {
      this.facing = 0;
    } else if (this.ySpeed < 0 && this.xSpeed > 0) {
      this.facing = -Math.PI * 1 / 4;
    } else if (this.ySpeed < 0 && this.xSpeed < 0) {
      this.facing = -Math.PI * 3 / 4;
    } else if (this.ySpeed < 0) {
      this.facing = -Math.PI * 1 / 2;
    } else if (this.xSpeed < 0) {
      this.facing = -Math.PI;
    }
  }
};

// Bullet
function Bullet(whoShot) {
  this.x = 0;
  this.y = 0;
  this.originY = 0;
  this.rotation = 0;
  this.speedX = 0;
  this.speedY = 0;
  this.playerId = whoShot;
  this.generate = function(playerX, playerY, velocityX, velocityY, rotation) {
    this.x = playerX;
    this.y = playerY + 50;
    this.originY = playerY;
    this.rotation = rotation;
  }
  this.move = function() {
    this.y = this.y + 20;
  }
};

function Game(p1, p1_websocket, game_id) {
  this.p1 = p1;

  this.timer = 18000;
  this.p1_websocket = p1_websocket;
  this.p2 = undefined;
  this.p2_websocket = undefined;
  this.id = game_id;
  this.waiting_for_players = true;
  this.closed = 0;
  this.bullets = [];
}

// communication
const wss = new ws.Server({
  server
});

var games = {};
var interval;
// var websockets = {};
var winners = [];
wss.on("connection", function(ws, req) {
  // if the connection comes from index.js
  if (req.url === "/") {
    var intv = function() {
      mongo.connect("mongodb://" + database.user + ":" + database.pass + "@" + database.host + ":" + database.port + "/" + database.dbName, {
        useUnifiedTopology: true
      }, (err, db) => {
        if (err) throw err;

        db.db("game").collection("recent_games").find({}).toArray((err, result) => {
          var recent_games = [];
          result.forEach((element) => {
            recent_games.push({
              game_id: element.game_id,
              winner: element.winner
            })
          });
          ws.send(JSON.stringify(["stats", "recent_games", recent_games]));
          db.close();
        });

        db.db("game").collection("recent_wins").find().sort({time: -1}).toArray((err, result) => {
          var recent_wins = [];
        if(result!=undefined){
          result.forEach((element) => {
            recent_wins.push({
              winner: element.name,
              time: element.time
            })
          });
        }
          ws.send(JSON.stringify(["stats", "recent_wins", recent_wins]));
          db.close();
        });
      });
      var size = 0,
        key;
      for (key in games) {
        if (games.hasOwnProperty(key)) size++;
      }
      ws.send(JSON.stringify(["stats", "games_atm", size]));
    }
    intv();
    var i = setInterval(intv, 20000);
    ws.on("close", () => {
      clearInterval(i);
    });
  } else {
    // TODO make id a string of chars and numbers
    // TODO randomize starting positions
    var id = Math.floor(Math.random() * Math.floor(100000)).toString();
    var p1 = new Player(id);
    var game_id;
    // first ever game on the server
    if (Object.entries(games).length === 0 && games.constructor === Object) {
      game_id = Math.floor(Math.random() * Math.floor(100000)).toString();
      games[game_id] = new Game(p1, ws, game_id);
    } else {
      for (var game in games) {
        // any game waits for players
        if (games[game].waiting_for_players) {
          p1.x = Math.floor((Math.random() * 500) + 2000);
          p1.y = Math.floor((Math.random() * 500) + 2000);
          games[game].p2 = p1;

          games[game].p2_websocket = ws;
          games[game].waiting_for_players = false;
          game_id = game;
          games[game_id].p1_websocket.send(JSON.stringify(["init", {
            player: games[game_id].p1,
            enemy: games[game_id].p2
          }]));
          games[game_id].p2_websocket.send(JSON.stringify(["init", {
            player: games[game_id].p2,
            enemy: games[game_id].p1
          }]));
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
      if (JSON.parse(message)[0] === "mouse_move") {
        p1.rotation = JSON.parse(message)[1].rotation;
        games[game_id].p1_websocket.send(JSON.stringify(["mouse_move", {
          id: p1.id,
          rotation: p1.rotation
        }]));
        games[game_id].p2_websocket.send(JSON.stringify(["mouse_move", {
          id: p1.id,
          rotation: p1.rotation
        }]));
      } else if (JSON.parse(message)[0] === "key_press") {
        if (JSON.parse(message)[1] === "up")
          p1.ySpeed = -p1.maxSpeed;
        if (JSON.parse(message)[1] === "down")
          p1.ySpeed = p1.maxSpeed;
        if (JSON.parse(message)[1] === "left")
          p1.xSpeed = -p1.maxSpeed;
        if (JSON.parse(message)[1] === "right")
          p1.xSpeed = p1.maxSpeed;
      } else if (JSON.parse(message)[0] === "key_up") {
        if (JSON.parse(message)[1] === "up") {
          p1.ySpeed = 0;
          // so that the client will know to stop displaying the tracks
          games[game_id].p1_websocket.send(JSON.stringify(["move", {
            x: p1.x,
            y: p1.y,
            id: p1.id,
            xSpeed: p1.xSpeed,
            ySpeed: p1.ySpeed,
            time: games[game_id].timer
          }]));
          games[game_id].p2_websocket.send(JSON.stringify(["move", {
            x: p1.x,
            y: p1.y,
            id: p1.id,
            xSpeed: p1.xSpeed,
            ySpeed: p1.ySpeed,
            time: games[game_id].timer
          }]));
        }
        if (JSON.parse(message)[1] === "down") {
          p1.ySpeed = 0;
          games[game_id].p1_websocket.send(JSON.stringify(["move", {
            x: p1.x,
            y: p1.y,
            id: p1.id,
            xSpeed: p1.xSpeed,
            ySpeed: p1.ySpeed,
            time: games[game_id].timer
          }]));
          games[game_id].p2_websocket.send(JSON.stringify(["move", {
            x: p1.x,
            y: p1.y,
            id: p1.id,
            xSpeed: p1.xSpeed,
            ySpeed: p1.ySpeed,
            time: games[game_id].timer
          }]));
        }
        if (JSON.parse(message)[1] === "left") {
          p1.xSpeed = 0;
          games[game_id].p1_websocket.send(JSON.stringify(["move", {
            x: p1.x,
            y: p1.y,
            id: p1.id,
            xSpeed: p1.xSpeed,
            ySpeed: p1.ySpeed,
            time: games[game_id].timer
          }]));
          games[game_id].p2_websocket.send(JSON.stringify(["move", {
            x: p1.x,
            y: p1.y,
            id: p1.id,
            xSpeed: p1.xSpeed,
            ySpeed: p1.ySpeed,
            time: games[game_id].timer
          }]));
        }
        if (JSON.parse(message)[1] === "right") {
          p1.xSpeed = 0;
          games[game_id].p1_websocket.send(JSON.stringify(["move", {
            x: p1.x,
            y: p1.y,
            id: p1.id,
            xSpeed: p1.xSpeed,
            ySpeed: p1.ySpeed,
            time: games[game_id].timer
          }]));
          games[game_id].p2_websocket.send(JSON.stringify(["move", {
            x: p1.x,
            y: p1.y,
            id: p1.id,
            xSpeed: p1.xSpeed,
            ySpeed: p1.ySpeed,
            time: games[game_id].timer
          }]));
        }
      } else if (JSON.parse(message)[0] === "shoot") {
        if (p1.reload <= 0 && p1.respawn < 3) {
          var dx = JSON.parse(message)[1].dx;
          var dy = JSON.parse(message)[1].dy;
          var hyp = JSON.parse(message)[1].hyp;

          var bullet = new Bullet(p1.id);
          bullet.generate(p1.x + 60, p1.y + 60, -dx * 20 / hyp, -dy * 20 / hyp, p1.rotation);
          games[game_id].bullets.push(bullet);
          p1.reload = 400;
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
      var dist = 40;
      var sphere1X, sphere1Y, sphere2X, sphere2Y;
      var circ1X, circ1Y, circ2X, circ2Y;
      if (games[game_id].timer < 3) {
        if (games[game_id].p1.killCount > games[game_id].p2.killCount) {
          games[game_id].p1_websocket.send(JSON.stringify(["winner", {
            id: games[game_id].p2.id
          }]));
          games[game_id].p2_websocket.send(JSON.stringify(["winner", {
            id: games[game_id].p2.id
          }]));
          winners.push({player:games[game_id].p2.id, game_id:game_id});
        } else {
          games[game_id].p1_websocket.send(JSON.stringify(["winner", {
            id: games[game_id].p1.id
          }]));
          games[game_id].p2_websocket.send(JSON.stringify(["winner", {
            id: games[game_id].p1.id
          }]));
          winners.push({player:games[game_id].p1.id, game_id:game_id});
        }
        games[game_id].p1_websocket.close();
        if (games[game_id].p2_websocket)
          games[game_id].p2_websocket.close();
        games[game_id].closed++;
        console.log("game set to be closed");
        console.log("clearing the interval\n")
        clearInterval(interval);
        console.log("_________________________________\n")

      } else {
        if (games[game_id].p2 != undefined) {
          games[game_id].timer -= 2;

          /*if(games[game_id].p1.facing*180/Math.PI===-180){
          	sphere1X=games[game_id].p1.x-dist;
          	sphere1Y=games[game_id].p1.y;
          }else if(games[game_id].p1.facing*180/Math.PI===-90){
          	sphere1Y=games[game_id].p1.y-dist;
          	sphere1X=games[game_id].p1.x;
          }else if(games[game_id].p1.facing*180/Math.PI===0){
          	sphere1X=games[game_id].p1.x+dist;
          	sphere1Y=games[game_id].p1.y;
          }else if(games[game_id].p1.facing*180/Math.PI===90){
          	sphere1Y=games[game_id].p1.y+dist;
          	sphere1X=games[game_id].p1.x;
          }else if(games[game_id].p1.facing*180/Math.PI===45){
          	sphere1Y=games[game_id].p1.y+dist*Math.sqrt(2)/2;
          	sphere1X=games[game_id].p1.x+dist*Math.sqrt(2)/2;
          }else if(games[game_id].p1.facing*180/Math.PI===-45){
          	sphere1Y=games[game_id].p1.y-dist*Math.sqrt(2)/2;
          	sphere1X=games[game_id].p1.x+dist*Math.sqrt(2)/2;
          }else if(games[game_id].p1.facing*180/Math.PI===135){
          	sphere1Y=games[game_id].p1.y+dist*Math.sqrt(2)/2;
          	sphere1X=games[game_id].p1.x-dist*Math.sqrt(2)/2;
          }else if(games[game_id].p1.facing*180/Math.PI===-135){
          	sphere1Y=games[game_id].p1.y-dist*Math.sqrt(2)/2;
          	sphere1X=games[game_id].p1.x-dist*Math.sqrt(2)/2;
          }
          if(games[game_id].p2.facing*180/Math.PI===-180){
          	sphere2X=games[game_id].p2.x-dist;
          	sphere2Y=games[game_id].p2.y;
          }else if(games[game_id].p2.facing*180/Math.PI===-90){
          	sphere2Y=games[game_id].p2.y-dist;
          	sphere2X=games[game_id].p2.x;
          }else if(games[game_id].p2.facing*180/Math.PI===0){
          	sphere2X=games[game_id].p2.x+dist;
          	sphere2Y=games[game_id].p2.y;
          }else if(games[game_id].p2.facing*180/Math.PI===90){
          	sphere2Y=games[game_id].p2.y+dist;
          	sphere2X=games[game_id].p2.x;
          }else if(games[game_id].p2.facing*180/Math.PI===45){
          	sphere2Y=games[game_id].p2.y+dist*Math.sqrt(2)/2;
          	sphere2X=games[game_id].p2.x+dist*Math.sqrt(2)/2;
          }else if(games[game_id].p2.facing*180/Math.PI===-45){
          	sphere2Y=games[game_id].p2.y-dist*Math.sqrt(2)/2;
          	sphere2X=games[game_id].p2.x+dist*Math.sqrt(2)/2;
          }else if(games[game_id].p2.facing*180/Math.PI===135){
          	sphere2Y=games[game_id].p2.y+dist*Math.sqrt(2)/2;
          	sphere2X=games[game_id].p2.x-dist*Math.sqrt(2)/2;
          }else if(games[game_id].p2.facing*180/Math.PI===-135){
          	sphere2Y=games[game_id].p2.y-dist*Math.sqrt(2)/2;
          	sphere2X=games[game_id].p2.x-dist*Math.sqrt(2)/2;
          }*/
          sphere2X = games[game_id].p2.x + 41 * Math.cos(games[game_id].p2.facing);
          sphere2Y = games[game_id].p2.y + 41 * Math.sin(games[game_id].p2.facing);
          sphere1X = games[game_id].p1.x + 41 * Math.cos(games[game_id].p1.facing);
          sphere1Y = games[game_id].p1.y + 41 * Math.sin(games[game_id].p1.facing);

          circ2X = games[game_id].p2.x - 20 * Math.cos(games[game_id].p2.facing);
          circ2Y = games[game_id].p2.y - 20 * Math.sin(games[game_id].p2.facing);
          circ1X = games[game_id].p1.x - 20 * Math.cos(games[game_id].p1.facing);
          circ1Y = games[game_id].p1.y - 20 * Math.sin(games[game_id].p1.facing);

          if (Math.sqrt((sphere2Y - sphere1Y) * (sphere2Y - sphere1Y) + (sphere1X - sphere2X) * (sphere1X - sphere2X)) < 78) {
            games[game_id].p2.y = games[game_id].p2.y - games[game_id].p2.ySpeed * 16 / 30;
            games[game_id].p2.x = games[game_id].p2.x - games[game_id].p2.xSpeed * 16 / 30;
            games[game_id].p1.y = games[game_id].p1.y - games[game_id].p1.ySpeed * 16 / 30;
            games[game_id].p1.x = games[game_id].p1.x - games[game_id].p1.xSpeed * 16 / 30;
            //console.log("collision "+sphere2X+" "+sphere1X+" "+Math.sqrt((sphere2Y-sphere1Y)*(sphere2Y-sphere1Y)+(sphere1X-sphere2X)*(sphere1X-sphere2X)));
          } else if (Math.sqrt((sphere2Y - circ1Y) * (sphere2Y - circ1Y) + (circ1X - sphere2X) * (circ1X - sphere2X)) < 78) {
            games[game_id].p2.y = games[game_id].p2.y - games[game_id].p2.ySpeed * 16 / 30;
            games[game_id].p2.x = games[game_id].p2.x - games[game_id].p2.xSpeed * 16 / 30;
            games[game_id].p1.y = games[game_id].p1.y - games[game_id].p1.ySpeed * 16 / 30;
            games[game_id].p1.x = games[game_id].p1.x - games[game_id].p1.xSpeed * 16 / 30;
            //console.log("collision "+sphere2X+" circ "+sphere1X+" "+Math.sqrt((sphere2Y-sphere1Y)*(sphere2Y-sphere1Y)+(sphere1X-sphere2X)*(sphere1X-sphere2X)));
          } else if (Math.sqrt((circ2Y - sphere1Y) * (circ2Y - sphere1Y) + (sphere1X - circ2X) * (sphere1X - circ2X)) < 78) {
            games[game_id].p2.y = games[game_id].p2.y - games[game_id].p2.ySpeed * 16 / 30;
            games[game_id].p2.x = games[game_id].p2.x - games[game_id].p2.xSpeed * 16 / 30;
            games[game_id].p1.y = games[game_id].p1.y - games[game_id].p1.ySpeed * 16 / 30;
            games[game_id].p1.x = games[game_id].p1.x - games[game_id].p1.xSpeed * 16 / 30;
            //console.log("collision "+sphere2X+" "+sphere1X+" "+Math.sqrt((sphere2Y-sphere1Y)*(sphere2Y-sphere1Y)+(sphere1X-sphere2X)*(sphere1X-sphere2X)));
          }
        }
        /*
        if(games[game_id].p2!=undefined){
        	if(Math.sqrt((games[game_id].p1.x-games[game_id].p2.x)*(games[game_id].p1.x-games[game_id].p2.x)+(games[game_id].p1.y-games[game_id].p2.y)*(games[game_id].p1.y-games[game_id].p2.y))<100){
        		console.log(games[game_id].p1.x+" x "+games[game_id].p2.x);
        	}


        }
        */
        p1.face();
        circ2X = p1.x + 41 * Math.cos(p1.facing);
        circ2Y = p1.y + 41 * Math.sin(p1.facing);
        circ1X = p1.x - 20 * Math.cos(p1.facing);
        circ1Y = p1.y - 20 * Math.sin(p1.facing);
        p1.respawn = Math.max(p1.respawn - 4, 0);
        if (p1.respawn <= 4) {
          if (p1.ySpeed === 0) {
            p1.x = Math.max(p1.x + p1.xSpeed * 2 * 4 / 30, 1000);
            p1.x = Math.min(p1.x, 3000);
          } else {
            p1.x = Math.max(p1.x + p1.xSpeed * Math.sqrt(50) * 4 / 150, 1000);
            p1.x = Math.min(p1.x, 3000);
          }
          if (p1.xSpeed === 0) {
            p1.y = Math.max(p1.y + p1.ySpeed * 2 * 4 / 30, 1000);
            p1.y = Math.min(p1.y, 2940);
          } else {
            p1.y = Math.max(p1.y + p1.ySpeed * Math.sqrt(50) * 4 / 150, 1000);
            p1.y = Math.min(p1.y, 2940);
          }

          if ((p1.ySpeed !== 0 || p1.xSpeed !== 0)) {
            games[game_id].p1_websocket.send(JSON.stringify(["move", {
              x: p1.x,
              y: p1.y,
              id: p1.id,
              xSpeed: p1.xSpeed,
              ySpeed: p1.ySpeed,
              time: games[game_id].timer
            }]));
            games[game_id].p2_websocket.send(JSON.stringify(["move", {
              x: p1.x,
              y: p1.y,
              id: p1.id,
              xSpeed: p1.xSpeed,
              ySpeed: p1.ySpeed,
              time: games[game_id].timer
            }]));
          }
        }
        if (p1.respawn > 24 && p1.respawn < 29) {

          p1.speedX = 0;
          p1.speedY = 0;
          let tempX, tempY;
          if (p1.id == games[game_id].p1.id) {
            tempX = games[game_id].p2.x;
            tempY = games[game_id].p2.y;
          } else {
            tempX = games[game_id].p1.x;
            tempY = games[game_id].p1.y;
          }

          p1.x = Math.floor((Math.random() * 2000) + 1000);
          p1.y = Math.floor((Math.random() * 2000) + 1000);
          while (Math.abs(tempX - p1.x) < 300) {
            p1.x = Math.floor((Math.random() * 2000) + 1000);
          }

          while (Math.abs(tempY - p1.y) < 200) {
            p1.y = Math.floor((Math.random() * 2000) + 1000);
          }

          games[game_id].p1_websocket.send(JSON.stringify(["move", {
            x: p1.x,
            y: p1.y,
            id: p1.id,
            xSpeed: p1.xSpeed,
            ySpeed: p1.ySpeed,
            time: games[game_id].timer
          }]));
          games[game_id].p2_websocket.send(JSON.stringify(["move", {
            x: p1.x,
            y: p1.y,
            id: p1.id,
            xSpeed: p1.xSpeed,
            ySpeed: p1.ySpeed,
            time: games[game_id].timer
          }]));

        }
        p1.reload = Math.max(p1.reload - 4, -4);

        if (p1.reload !== -4) {
          games[game_id].p1_websocket.send(JSON.stringify(["reload", {
            id: p1.id,
            reload: p1.reload
          }]));
          games[game_id].p2_websocket.send(JSON.stringify(["reload", {
            id: p1.id,
            reload: p1.reload
          }]));
        }

        games[game_id].bullets.forEach(function(element, index, object) {
          element.move();
          //console.log(element.x+" "+element.y+" "+circ2X+" "+circ2Y);
          var buly, bulx, bulHyp;
          bulHyp = element.y - element.originY;
          buly = element.originY + bulHyp * Math.sin(element.rotation) - 60;
          bulx = element.x + bulHyp * Math.cos(element.rotation) - 60;
          //console.log(buly+" "+bulx+" "+p1.x+" "+p1.y+" "+bulHyp);
          if (element.playerId != p1.id && ((Math.sqrt((buly - circ1Y) * (buly - circ1Y) + (bulx - circ1X) * (bulx - circ1X)) <= 46) || (Math.sqrt((buly - circ2Y) * (buly - circ2Y) + (bulx - circ2X) * (bulx - circ2X)) <= 47))) {
            //console.log("shot" + buly+" "+bulx+" "+circ2Y+" "+circ2X+" "+circ1Y+" "+circ1X);
            object.splice(index, 1);
            /*
            	ADD YOU GOT SHOT MESSAGE
            */
            p1.killCount++;
            p1.respawn = 200;
            games[game_id].p1_websocket.send(JSON.stringify(["dead", {
              dead: true,
              respawn: 200,
              id: p1.id,
              killCount: p1.killCount
            }]));
            games[game_id].p2_websocket.send(JSON.stringify(["dead", {
              dead: true,
              respawn: 200,
              id: p1.id,
              killCount: p1.killCount
            }]));
          } else {
            games[game_id].p1_websocket.send(JSON.stringify(["shoot", {
              id: element.playerId,
              x: element.x,
              y: element.y,
              rotation: element.rotation
            }]));
            games[game_id].p2_websocket.send(JSON.stringify(["shoot", {
              id: element.playerId,
              x: element.x,
              y: element.y,
              rotation: element.rotation
            }]));
            if (element.y < -500 || element.y > 5000) {
              object.splice(index, 1);
            }
          }

        });
      }
    }, 20);
    ws.on("close", () => {
      console.log("connection closed");
      games[game_id].p1_websocket.close();
      if (games[game_id].p2_websocket)
        games[game_id].p2_websocket.close();
      games[game_id].closed++;
      console.log("game set to be closed");
      console.log("clearing the interval\n")
      clearInterval(interval);
      console.log("_________________________________\n")
    });
  }
});

setInterval(() => {
  for (game in games) {
    if (games[game].closed >= 2) {
      delete games[game];
      console.log("deleted the game associated with id " + game);
    }
  }
}, 5000);
