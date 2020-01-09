var socket = new WebSocket("ws://localhost:8080/index.js");

var WIDTH = document.getElementById("canv").width;
var HEIGHT = document.getElementById("canv").height;

function draw(){
  document.getElementById("canv").width = window.innerWidth*0.65;
  document.getElementById("canv").height = window.innerHeight*0.75;
  WIDTH = document.getElementById("canv").width;
  HEIGHT = document.getElementById("canv").height;
  drawPlayers(p, other_players);
  // console.log(WIDTH+"; "+ HEIGHT);
  //socket.send(JSON.stringify(["screen_size", {WIDTH:WIDTH, HEIGHT:HEIGHT}]));
  //p.draw(canvas);
}

var canvas = document.getElementById("canv").getContext("2d");
window.addEventListener("load", draw);
window.addEventListener("resize", draw);
// TODO refactor
window.addEventListener("keydown", (event) => {
  // only register the the keydown once (when holding a key down)
  if (event.repeat) { return; }

  if (event.keyCode === 65) {
    p.pressingLeft = true;
    socket.send(JSON.stringify(["key_press", {pressingLeft: true}]));
  }
  else if (event.keyCode === 83) {
    p.pressingDown = true;
    socket.send(JSON.stringify(["key_press", {pressingDown: true}]));
  }
  else if (event.keyCode === 68) {
    p.pressingRight = true;
    socket.send(JSON.stringify(["key_press", {pressingRight: true}]));
  }
  else if (event.keyCode === 87) {
    p.pressingUp = true;
    socket.send(JSON.stringify(["key_press", {pressingUp: true}]));
  }
});
window.addEventListener("keyup", (event) => {
  if (event.keyCode === 65) {
    p.pressingLeft = false;
    socket.send(JSON.stringify(["key_press", {pressingLeft: false}]));
  }
  else if (event.keyCode === 83) {
    p.pressingDown = false;
    socket.send(JSON.stringify(["key_press", {pressingDown: false}]));
  }
  else if (event.keyCode === 68) {
    p.pressingRight = false;
    socket.send(JSON.stringify(["key_press", {pressingRight: false}]));
  }
  else if (event.keyCode === 87) {
    p.pressingUp = false;
    socket.send(JSON.stringify(["key_press", {pressingUp: false}]));
  }
});


var Player = function(id) {
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
  if (id)
    self.id = id;
  self.image = new Image();
  self.image.src = "/img/player.png";
  self.x = 0;
  self.y = 0;
  self.map = new Image();
  self.map.src = "/img/map.png"

  self.draw = function(canvas) {
    if (self.id === id) {
      canvas.drawImage(self.map, 0 + self.x, 0 + self.y);
      canvas.drawImage(self.image, WIDTH/2 - self.image.width/2, HEIGHT/2 - self.image.height/2);
    }
  }

  // TODO delete/refactor
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

    self.x += self.speed_x;
    self.y += self.speed_y;
  }

  return self;
}

var Enemy = function (player) {
  var self = player;
  self.image = new Image();
  self.image.src = "/img/player.png";
  self.draw = function(canvas) {
    canvas.drawImage(self.image, p.x - self.x + WIDTH/2 - self.image.width/2, p.y - self.y + HEIGHT/2 - self.image.height/2);
  }

  return self;
}

var drawPlayers = function(p, other_players) {
  canvas.clearRect(0, 0, WIDTH, HEIGHT);
  p.draw(canvas);
  for (players_id in other_players)
    other_players[players_id].draw(canvas);
}

var p; var id = "";

socket.onopen = function(data) {
  // ...
}
socket.onmessage = function(data) {
  //alert(JSON.parse(data.data)[0] + "; id = " + JSON.parse(data.data)[1].id + ", name = " + JSON.parse(data.data)[1].name);
  // if it is the first ever message from the server socket
  if (JSON.parse(data.data)[0] === "init" && id === "") {
    id = JSON.parse(data.data)[1].player.id;
    p = Player(id);

    players = JSON.parse(data.data)[1].other_players;
    other_players = {};
    for(players_id in players) {
      if (players_id !== id)
        other_players[players_id] = Enemy(players[players_id]);
    }
    // console.log(players)
    // give it time to fetch the images
    setTimeout(()=>{
      drawPlayers(p, other_players);
    }, 200);
  }

  else if (JSON.parse(data.data)[0] === "init") {
    other_players[JSON.parse(data.data)[1].player.id] = Enemy(JSON.parse(data.data)[1].player);
    drawPlayers(p, other_players);
  }
  if (JSON.parse(data.data)[0] === "move") {
    if (JSON.parse(data.data)[1].player.id === p.id) {
      p.pressingUp = JSON.parse(data.data)[1].player.pressingUp;
      p.pressingDown = JSON.parse(data.data)[1].player.pressingDown;
      p.pressingLeft = JSON.parse(data.data)[1].player.pressingLeft;
      p.pressingRight = JSON.parse(data.data)[1].player.pressingRight;

      //p.updatePosition();
      p.x = JSON.parse(data.data)[1].player.x;
      p.y = JSON.parse(data.data)[1].player.y;
      drawPlayers(p, other_players);
    }
    else {
      other_players[JSON.parse(data.data)[1].player.id].x = JSON.parse(data.data)[1].player.x;
      other_players[JSON.parse(data.data)[1].player.id].y = JSON.parse(data.data)[1].player.y;
      drawPlayers(p, other_players);
    }
  }
}

/* close the socket ?*/
// socket.close(1000, "Work complete");
