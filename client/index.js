var socket = new WebSocket("ws://localhost:8080/index.js");

//Player object
function Player(init) {
  for (var attr in init) {
    this[attr] = init[attr];
  }

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
  this.setrotation = function(angle) {
    this.rotation = angle;
  };
  this.setySpeed = function(velocity) {
    this.ySpeed = velocity;

  };
  this.setxSpeed = function(velocity) {
    this.xSpeed = velocity;

  };

};

function Enemy(init) {
  for (var attr in init) {
    this[attr] = init[attr];
  }

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
}

//Button object
function Bullet(whoShot) {
  this.x = 0;
  this.y = 0;
  this.rotation = 0;
  this.speedX = 0;
  this.speedY = 0;
  this.playerId = whoShot;
  this.generate = function(playerX, playerY, velocityX, velocityY, rotation) {

    this.x = playerX;
    this.y = playerY + 50;
    this.rotation = rotation;
  }
  this.move = function() {
    this.y = this.y + 20;

  }
};

var canvas = document.getElementById("game");
canvas.onselectstart = function() {
  return false;
}
var ctx = canvas.getContext("2d");
var ctx2 = canvas.getContext("2d");
var gun = document.getElementById("gun");
var hull = document.getElementById("hull");
var backgroundView = document.getElementById("inback");
var p1, enemy;
var mouse = [0, 0];
var point = [canvas.width / 2, canvas.height / 2];
var tracksImg = document.getElementById("tracks");
var shell = document.getElementById("shell");
var f1 = document.getElementById("flash1");
var f2 = document.getElementById("flash2");
var f3 = document.getElementById("flash3");
var bullets = [];


canvas.addEventListener('click', (ev) => {
  if (p1.reload === 0) {
    var c = new Bullet(p1.id);
    var dx = ev.clientX + pageXOffset - 9 - point[0];
    var dy = ev.clientY + pageYOffset - 9 - point[1];
    var hyp = Math.sqrt(dx * dx + dy * dy);
    c.generate(p1.x + 60, p1.y + 60, -dx * 20 / hyp, -dy * 20 / hyp, p1.rotation);
    bullets.push(c);
    p1.reload = 80;
  }
});

window.addEventListener('mousemove', (ev) => {
  if (p1) {
    mouse[0] = ev.clientX + this.pageXOffset;
    mouse[1] = ev.clientY + this.pageYOffset;
    var dx = mouse[0] - point[0] - 9 - (window.innerWidth - canvas.width)/2,
      dy = mouse[1] - point[1] - 9,
      rot = Math.atan2(dy, dx);

    p1.setrotation(rot);
    render(ctx, 900, 600);
  }
});

window.addEventListener('keypress', (e) => {

  if (event.repeat) { return; }

  if (e.code === 'KeyW') {
    socket.send(JSON.stringify(["key_press", "up"]));
  } else if (e.code === 'KeyD') {
    //p1.setxSpeed(10);
    socket.send(JSON.stringify(["key_press", "right"]));
  } else if (e.code === 'KeyS') {
    //p1.setySpeed(10);
    socket.send(JSON.stringify(["key_press", "down"]));
  } else if (e.code === 'KeyA') {
    //p1.setxSpeed(-10);
    socket.send(JSON.stringify(["key_press", "left"]));
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === 'KeyW') {
    //p1.setySpeed(0);
    socket.send(JSON.stringify(["key_up", "up"]));
  } else if (e.code === 'KeyD') {
    //p1.setxSpeed(0);
    socket.send(JSON.stringify(["key_up", "right"]));
  } else if (e.code === 'KeyS') {
    //p1.setySpeed(0);
    socket.send(JSON.stringify(["key_up", "down"]));
  } else if (e.code === 'KeyA') {
    //p1.setxSpeed(0);
    socket.send(JSON.stringify(["key_up", "left"]));
  }
});


socket.onmessage = function(data) {
  var message = JSON.parse(data.data);

  if (message[0] === "init") {
    p1 = new Player(message[1].player);
    enemy = new Enemy(message[1].enemy);
    document.getElementById("waiting").style.display = "none";
    document.getElementById("loaded").style.display = "block";
  }

  else if (message[0] === "move") {
    var x = message[1].x;
    var y = message[1].y;

    // player 1 moves
    if (message[1].id === p1.id) {
      p1.x = x;
      p1.y = y;
      p1.xSpeed = message[1].xSpeed;
      p1.ySpeed = message[1].ySpeed;
    }

    else if (message[1].id === enemy.id){
      enemy.x = x;
      enemy.y = y;
      enemy.xSpeed = message[1].xSpeed;
      enemy.ySpeed = message[1].ySpeed;
    }
  }

  p1.face();
  enemy.face();
  render(ctx, 900, 600);
}

socket.onclose = function() {
  console.log("closed")
}

// var speed = setInterval(() => {
//   if (p1.ySpeed === 0) {
//     p1.x = p1.x + p1.xSpeed * 2 / 6;
//   } else {
//     p1.x = p1.x + p1.xSpeed * Math.sqrt(50) / 30;
//   }
//   if (p1.xSpeed === 0) {
//     p1.y = p1.y + p1.ySpeed * 2 / 6;
//   } else {
//     p1.y = p1.y + p1.ySpeed * Math.sqrt(50) / 30;
//   }
//
//   p1.face();
//   render(ctx, 900, 600);
// }, 25);

function render(ctx, width, height) {
  ctx.clearRect(0, 0, width, height)
  let x = canvas.width / 2,
    y = canvas.height / 2;
  ctx.drawImage(backgroundView, -p1.x, -p1.y);
  ctx.save();

  ctx.translate(x, y);
  var index = 0;

  ctx.rotate(p1.facing + 90 * Math.PI / 180);

  if (p1.xSpeed !== 0 || p1.ySpeed !== 0) {

    ctx.drawImage(tracksImg, -65, 20, tracksImg.width * 2 / 3, tracksImg.height * 2 / 3);
    ctx.drawImage(tracksImg, -15, 20, tracksImg.width * 2 / 3, tracksImg.height * 2 / 3);
  }
  ctx.drawImage(hull, -85, -97, hull.width * 2 / 3, hull.height * 2 / 3);

  ctx.restore();

  ctx.save()
  ctx.translate(enemy.x - p1.x + width/2 + 150, enemy.y-p1.y + height/2 + 100);
  ctx.rotate(enemy.facing + 90 * Math.PI / 180);
  ctx.drawImage(hull, -85, -97, hull.width * 2 / 3, hull.height * 2 / 3)
  ctx.restore();

  ctx.save();

  ctx.translate(x, y);
  for (; index < bullets.length; ++index) {
    ctx.save();
    ctx.rotate(bullets[index].rotation + 90 * Math.PI / 180);
    ctx.drawImage(shell, -35, p1.y - bullets[index].y, shell.width * 2 / 3, shell.height * 2 / 3);
    bullets[index].move();
    if (bullets[index].y < -500 || bullets[index].y > 5000) {
      console.log(index + " " + bullets.length);
      bullets.splice(index, 1);
      index--;
    }
    ctx.restore();
  }
  ctx.rotate(p1.rotation + 90 * Math.PI / 180);

  if (p1.reload <= 80 && p1.reload > 78) {
    ctx.drawImage(flash1, -60, -200);
  } else if (p1.reload <= 78 && p1.reload > 74) {
    ctx.drawImage(flash2, -60, -200);
  } else if (p1.reload <= 74 && p1.reload > 70) {
    ctx.drawImage(flash3, -60, -200);
  }

  ctx.drawImage(gun, -20, -73, gun.width * 2 / 3, gun.height * 2 / 3);

  ctx.restore();
  p1.reload = Math.max(p1.reload - 1, 0);
}
