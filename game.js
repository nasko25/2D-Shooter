var socket = new WebSocket("ws://localhost:8080/index.js");

var WIDTH = document.getElementById("canv").width;
var HEIGHT = document.getElementById("canv").height;

function draw(){

  socket.send(JSON.stringify(["init", p]));

  document.getElementById("canv").width = window.innerWidth*0.65;
  document.getElementById("canv").height = window.innerHeight*0.75;
  WIDTH = document.getElementById("canv").width;
  HEIGHT = document.getElementById("canv").height;
  console.log(WIDTH+"; "+ HEIGHT);
  p.draw(canvas);
}

var canvas = document.getElementById("canv").getContext("2d");
window.addEventListener("load", draw);
window.addEventListener("resize", draw);
window.addEventListener("keydown", (event) => {
  if (event.keyCode === 65) {
    p.pressingLeft = true;
  }
  else if (event.keyCode === 83) {
    p.pressingDown = true;
  }
  else if (event.keyCode === 68) {
    p.pressingRight = true;
  }
  else if (event.keyCode === 87) {
    p.pressingUp = true;
  }
});
window.addEventListener("keyup", (event) => {
  if (event.keyCode === 65) {
    p.pressingLeft = false;
  }
  else if (event.keyCode === 83) {
    p.pressingDown = false;
  }
  else if (event.keyCode === 68) {
    p.pressingRight = false;
  }
  else if (event.keyCode === 87) {
    p.pressingUp = false;
  }
});


var Player = function() {
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
  self.image = new Image();
  self.image.src = "/img/player.png";
  self.x = WIDTH/2 - self.image.width/2;
  self.y = HEIGHT/2 - self.image.height/2;
  self.map = new Image();
  self.map.src = "/img/map.png"

  self.draw = function(canvas) {
    canvas.drawImage(self.map, 0 + self.x, 0 + self.y);
    canvas.drawImage(self.image, WIDTH/2 - self.image.width/2, HEIGHT/2 - self.image.height/2);
  }

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
var p = Player();


socket.onopen = function(data) {
  // ...
}
socket.onmessage = function(data) {
  //alert(JSON.parse(data.data)[0] + "; id = " + JSON.parse(data.data)[1].id + ", name = " + JSON.parse(data.data)[1].name);
  // if it is the first ever message from the server socket
}

setInterval(() => {
  canvas.clearRect(0, 0, WIDTH, HEIGHT);
  p.updatePosition();
  p.draw(canvas);
}, 30);

/* close the socket */
// socket.close(1000, "Work complete");
