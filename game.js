var socket = new WebSocket("ws://localhost:8080/index.js")

var Images = {};
Images.player = new Image();
Images.player.src = "img/player.png";
Images.bullet = new Image();
Images.bullet.src = "img/bullet";
Images.map = new Image();
Images.map.src = "img/map";

function resize(){
  document.getElementById("canv").width = window.innerWidth*0.65;
  document.getElementById("canv").height = window.innerHeight*0.75;
  var WIDTH = document.getElementById("canv").width;
  var HEIGHT = document.getElementById("canv").height;
  console.log(WIDTH+"; "+ HEIGHT);
  canvas.beginPath();
  canvas.rect(20, 20, 150, 100);
  canvas.stroke();
}

var canvas = document.getElementById("canv").getContext("2d");
window.addEventListener('resize', resize);
resize();

var Player = function(initilize){
  var self = {};
  self.id = initilize.id;
  self.x = initilize.x;
  self.y = initilize.y;
  self.hp = initilize.hp;
  self.max_hp = initilize.max_hp;
  self.score = initilize.score;

  self.draw = function() {
    // relative x and y
    var x = self.x - Player.list[self_id].x + WIDTH/2;
    var y = self.y - Player.list[self_id].y + HEIGHT/2;

    var hp_bar_width = 30*self.hp/self.hpMax;
    // hp bar
    canvas.fillStyle = "red";
    canvas.fillRect(x - hp_bar_width/2, y - 40, hp_bar_width, 4);

    //player
    // ctx.fillText(self.number, self.x, self.y);
    var width = Images.player.width*2;
    var height = Images.player.height*2;

    canvas.drawImage(Images.player, 0, 0, Images.player.width, Images.player.height, x-width/2, y-height/2, width, height);
  }

  Player.list[self.id] = self;
  return self;
}

Player.list = {};

var self_id = null;

socket.onopen = function(data) {
  // ...
}
socket.onmessage = function(data) {
  // if it is the first ever message from the server socket
  if (data.is_initial_message) {
    if (data.self_id) {
      self_id = data.self_id;
    }

    for (var i = 0; i < data.players.length; i++) {
      new Player(data.players[i]);
    }
  }
  // update players' positions
  else if (data.is_update_message){
    // { players : [{id:1, x:0, y:0}, {id:1337, x:0, y:0}], bullet : []}
    for (var i = 0; i < data.players.length; i++) {
     var pack = data.players[i];
     var p = Player.list[pack.id];
     if (p) {
       if (pack.x !== undefined)
         p.x = pack.x;
       if (pack.y !== undefined)
         p.y = pack.y;
       if (pack.hp !== undefined)
         p.hp = pack.hp;
       if (pack.score !== undefined)
         p.score = pack.score;
       if (pack.map !== undefined)
         p.map = pack.map;
     }
    }
  }
  // when a player has died/disconnected
  else if (data.is_remove_message) {
    // {players:[123]
       for (var i = 0; i < data.players.length; i++) {
         delete Player.list[data.players[i]];
       }
  }

  // alert(data.data);
}

/* close the socket */
// socket.close(1000, "Work complete");
