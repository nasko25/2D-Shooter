var socket = new WebSocket("ws://localhost:8080/game.js");

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
var clientObject;
var mouse = [0, 0];
var point = [canvas.width / 2, canvas.height / 2];
var tracksImg = document.getElementById("tracks");
var shell = document.getElementById("shell");
var f1 = document.getElementById("flash1");
var f2 = document.getElementById("flash2");
var f3 = document.getElementById("flash3");
var ex1 = document.getElementById("ex1");
var ex2 = document.getElementById("ex2");
var ex3 = document.getElementById("ex3");
var ex4 = document.getElementById("ex4");
var ex5 = document.getElementById("ex5");
var ex6 = document.getElementById("ex6");
var ex7 = document.getElementById("ex7");
var ex8 = document.getElementById("ex8");
var bullets = [];
var scorePlayer = document.getElementById("player");
var enemyScore = document.getElementById("enemy");
var scoreCountPlayer = document.getElementById("score-player");
var scoreCountEnemy = document.getElementById("score-enemy");
var cannonSound = new Audio("Cannon+2.mp3");
var ding = new Audio("ding.mp3");
var reloadText = document.getElementById("reloading");
var timerText = document.getElementById("timer");

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
//Enemy object
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

//client
function clientView(id) {
  this.id = 0;
  this.x = 0;
  this.y = 0;
  this.speedY = 0;
  this.speedX = 0;
  this.rotate = 0;
  this.timer = 18000;
  this.renderAlpha = 0;
  this.winner = false;
}
// Bullet object
function Bullet(whoShot) {
  this.x = 0;
  this.y = 0;
  this.rotation = 0;
  this.speedX = 0;
  this.speedY = 0;
  this.playerId = whoShot;
  // this.generate = function(playerX, playerY, velocityX, velocityY, rotation) {
  //
  //   this.x = playerX;
  //   this.y = playerY + 50;
  //   this.rotation = rotation;
  // }
  // this.move = function() {
  //   this.y = this.y + 20;
  //
  // }
};

canvas.addEventListener('click', (ev) => {

  if (p1.reload <= 0) {
    cannonSound.volume = 0.6;
    cannonSound.play();
    var dx = ev.clientX + pageXOffset - 9 - point[0];
    var dy = ev.clientY + pageYOffset - 9 - point[1];
    var hyp = Math.sqrt(dx * dx + dy * dy);
    socket.send(JSON.stringify(["shoot", {
      id: p1.id,
      dx: dx,
      dy: dy
    }]));
  } else {
    reloadText.style.display = "block";
  }
  // if (p1.reload === 0) {
  //   var c = new Bullet(p1.id);
  //
  //   c.generate(p1.x + 60, p1.y + 60, -dx * 20 / hyp, -dy * 20 / hyp, p1.rotation);
  //   bullets.push(c);
  //   p1.reload = 80;
  // }
});

window.addEventListener('mousemove', (ev) => {
  if (p1) {
    mouse[0] = ev.clientX + this.pageXOffset;
    mouse[1] = ev.clientY + this.pageYOffset;
    var dx = mouse[0] - point[0] - canvas.offsetLeft - 3,
      dy = mouse[1] - point[1] - canvas.offsetTop - 3,
      rot = Math.atan2(dy, dx);
    clientObject.rotate = rot;
    // p1.setrotation(rot);
    // render(ctx, 900, 600);
    socket.send(JSON.stringify(["mouse_move", {
      rotation: rot
    }]));
  }
});

//Movement listeners:
window.addEventListener('keypress', (e) => {

  if (event.repeat) {
    return;
  }

  if (e.code === 'KeyW') {
    clientObject.speedY = -10;
    socket.send(JSON.stringify(["key_press", "up"]));
  } else if (e.code === 'KeyD') {
    clientObject.speedX = 10;
    socket.send(JSON.stringify(["key_press", "right"]));
  } else if (e.code === 'KeyS') {
    clientObject.speedY = 10;
    socket.send(JSON.stringify(["key_press", "down"]));
  } else if (e.code === 'KeyA') {
    clientObject.speedX = -10;
    socket.send(JSON.stringify(["key_press", "left"]));
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === 'KeyW') {
    clientObject.speedY = 0;
    socket.send(JSON.stringify(["key_up", "up"]));
  } else if (e.code === 'KeyD') {
    clientObject.speedX = 0;
    socket.send(JSON.stringify(["key_up", "right"]));
  } else if (e.code === 'KeyS') {
    clientObject.speedY = 0;
    socket.send(JSON.stringify(["key_up", "down"]));
  } else if (e.code === 'KeyA') {
    clientObject.speedX = 0;
    socket.send(JSON.stringify(["key_up", "left"]));
  } else if (e.code === 'KeyP') {
    p1.dead = true;
    p1.respawn = 80;
  }
});

//END OF MOVEMENT LISTENERS



//Server Connection
socket.onmessage = function(data) {
  var message = JSON.parse(data.data);
  updated = true;
  if (message[0] === "init") {
    p1 = new Player(message[1].player);
    clientObject = new clientView(p1.id);

    enemy = new Enemy(message[1].enemy);
    document.getElementById("waiting").style.display = "none";
    document.getElementById("loaded").style.display = "block";
  } else if (message[0] === "move") {
    var x = message[1].x;
    var y = message[1].y;
    clientObject.timer = message[1].time;
    // player 1 moves
    if (message[1].id === p1.id) {
      p1.x = x;
      p1.y = y;
      p1.xSpeed = message[1].xSpeed;
      p1.ySpeed = message[1].ySpeed;

      p1.face();
    } else if (message[1].id === enemy.id) {
      enemy.x = x;
      enemy.y = y;
      enemy.xSpeed = message[1].xSpeed;
      enemy.ySpeed = message[1].ySpeed;

      enemy.face();
    }
  } else if (message[0] === "mouse_move") {
    if (message[1].id === p1.id) {
      p1.rotation = message[1].rotation;
    } else if (message[1].id === enemy.id) {
      enemy.rotation = message[1].rotation;
    }
  } else if (message[0] === "shoot") {
    var in_array = false;
    bullets.forEach((element) => {
      if (element.id === message[1].id) {
        in_array = true;
        element.rotation = message[1].rotation;
        element.y = message[1].y;
        //break;
      }
    })

    if (!in_array) {
      bullets.push({
        rotation: message[1].rotation,
        y: message[1].y,
        id: message[1].id
      });
    }
    if (message[1].id === p1.id) {
      //p1.reload = message[1].reload;
    } else if (message[1].id === enemy.id) {
      //enemy.reload = message[1].reload;
    }
  } else if (message[0] === "dead") {
    if (message[1].id === p1.id) {
      p1.dead = true;
      p1.killCount++;
      scoreCountEnemy.innerHTML = p1.killCount;
      if (p1.killCount > enemy.killCount) {
        ding.play();
        scorePlayer.style.top = "8%";
        enemyScore.style.top = "5%";
      }
      p1.respawn = 200;
      //p1.reload=message[1].reload;
    } else if (message[1].id === enemy.id) {
      enemy.dead = true;
      enemy.killCount++;
      scoreCountPlayer.innerHTML = enemy.killCount;
      if (p1.killCount < enemy.killCount) {
        scorePlayer.style.top = "5%";
        enemyScore.style.top = "8%";
      }
      console.log(enemy.killCount);
      enemy.respawn = 200;
      //enemy.reload=message[1].reload;
    }
  } else if (message[0] === "reload") {
    if (message[1].id === p1.id) {
      p1.reload = message[1].reload;
    } else if (message[1].id === enemy.id) {
      if (message[1].reload > 396) {
        var distance = Math.min(Math.sqrt(Math.pow(p1.x - enemy.x, 2) + Math.pow(p1.y - enemy.y, 2)), 40);

        cannonSound.volume = 0.7 / (Math.pow(distance / 40, 2));
        cannonSound.play();
      }
      enemy.reload = message[1].reload;
    }
  } else if (message[0] === "winner") {
    clientObject.timer = 0;
    if (message[1].id === p1.id) {
      clientObject.winner = true;

    } else if (message[1].id === enemy.id) {
      clientObject.winner = false;
    }
  }
}

socket.onclose = function() {
  console.log("closed");
}

//Client side rendering


var updated = false;
var speed = setInterval(() => {
  if (!p1.dead) {
    if (clientObject.speedY === 0) {
      clientObject.x = clientObject.x + clientObject.speedX * 2 / 6;
    } else {
      clientObject.x = clientObject.x + clientObject.speedX * Math.sqrt(50) / 30;
    }
    if (clientObject.speedX === 0) {
      clientObject.y = clientObject.y + clientObject.speedY * 2 / 6;
    } else {
      clientObject.y = clientObject.y + clientObject.speedY * Math.sqrt(50) / 30;
    }
  }
  if (updated) {
    //Check if client differs from server:
    if (Math.abs(clientObject.x - p1.x) > 3) {
      clientObject.x = p1.x;
    }
    if (Math.abs(clientObject.y - p1.y) > 3) {
      clientObject.y = p1.y;
      //console.log(" updateD: "+clientObject.y+" a "+clientObject.speedY);

    }
    if (clientObject.speedX !== p1.xSpeed) {
      clientObject.speedX = p1.xSpeed;
    }
    if (clientObject.speedY !== p1.ySpeed) {
      clientObject.speedY = p1.ySpeed;
    }
    updated = false;
  }

  clientObject.timer = Number(clientObject.timer);
  let minutes = clientObject.timer;
  timerText.innerHTML = minutes + ":";
  render(ctx, 900, 600);
}, 25);


// TODO function too big; extract smaller functions and call only them, not calling render() each time
function render(ctx, width, height) {

  ctx.clearRect(0, 0, width, height);
  let clX = clientObject.x,
    clY = clientObject.y,
    clSpeedX = clientObject.speedX,
    clSpeedY = clientObject.speedY,
    clfacing = 0,
    clRotation = clientObject.rotate;
  // draw the background

  let x = canvas.width / 2,
    y = canvas.height / 2;
  ctx.drawImage(backgroundView, -clX, -clY);

  // draw the player
  if (!p1.dead || p1.respawn > 170) {
    ctx.save();
    ctx.translate(x, y);
    var index = 0;

    ctx.rotate(p1.facing + 90 * Math.PI / 180);
    //console.log(clY+" "+(clY+40*Math.max(Math.sin(p1.facing),-10))+" "+(clX+40*Math.max(Math.cos(p1.facing),-10)));
    if (clSpeedX !== 0 || clSpeedY !== 0) {

      ctx.drawImage(tracksImg, -65, 20, tracksImg.width * 2 / 3, tracksImg.height * 2 / 3);
      ctx.drawImage(tracksImg, -15, 20, tracksImg.width * 2 / 3, tracksImg.height * 2 / 3);
    }
    ctx.drawImage(hull, -85, -97, hull.width * 2 / 3, hull.height * 2 / 3);



    ctx.restore();
  }
  // draw the enemy
  ctx.save();
  ctx.translate(enemy.x - clX + width / 2 + 150, enemy.y - clY + height / 2 + 100);
  if (!enemy.dead || enemy.respawn > 170) {
    ctx.rotate(enemy.facing + 90 * Math.PI / 180);
    if (enemy.xSpeed !== 0 || enemy.ySpeed !== 0) {

      ctx.drawImage(tracksImg, -65, 20, tracksImg.width * 2 / 3, tracksImg.height * 2 / 3);
      ctx.drawImage(tracksImg, -15, 20, tracksImg.width * 2 / 3, tracksImg.height * 2 / 3);
    }
    ctx.drawImage(hull, -85, -97, hull.width * 2 / 3, hull.height * 2 / 3);
  }
  ctx.restore();

  // draw the enemy's gun
  ctx.save();
  ctx.translate(enemy.x - clX + width / 2 + 150, enemy.y - clY + height / 2 + 100);
  if (!enemy.dead || enemy.respawn > 170) {
    ctx.rotate(enemy.rotation + 90 * Math.PI / 180);
    ctx.drawImage(gun, -20, -73, gun.width * 2 / 3, gun.height * 2 / 3);
  }
  if (enemy.dead) {
    var exx = -130,
      exy = -140;
    if (enemy.respawn <= 200 && enemy.respawn > 190) {
      ctx.drawImage(ex1, exx, exy);
    } else if (enemy.respawn <= 190 && enemy.respawn > 180) {
      ctx.drawImage(ex2, exx, exy);
    } else if (enemy.respawn <= 180 && enemy.respawn > 170) {
      ctx.drawImage(ex3, exx, exy);
    } else if (enemy.respawn <= 170 && enemy.respawn > 160) {
      ctx.drawImage(ex4, exx, exy);
    } else if (enemy.respawn <= 160 && enemy.respawn > 150) {
      ctx.drawImage(ex5, exx, exy);
    } else if (enemy.respawn <= 150 && enemy.respawn > 140) {
      ctx.drawImage(ex6, exx, exy);
    } else if (enemy.respawn <= 140 && enemy.respawn > 130) {
      ctx.drawImage(ex7, exx, exy);
    } else if (enemy.respawn <= 130 && enemy.respawn > 120) {
      ctx.drawImage(ex8, exx, exy);
    }
    enemy.respawn -= 5;
    if (enemy.respawn < 1) {
      enemy.dead = false;
    }
  }
  ctx.restore();

  // draw the bullets
  ctx.save();
  ctx.translate(x, y);
  // for (; index < bullets.length; ++index) {
  //   ctx.save();
  //   ctx.rotate(bullets[index].rotation + 90 * Math.PI / 180);
  //   ctx.drawImage(shell, -35, p1.y - bullets[index].y, shell.width * 2 / 3, shell.height * 2 / 3);
  //   bullets[index].move();
  //   if (bullets[index].y < -500 || bullets[index].y > 5000) {
  //     console.log(index + " " + bullets.length);
  //     bullets.splice(index, 1);
  //     index--;
  //   }
  //   ctx.restore();
  // }
  //

  for (; index < bullets.length; ++index) {
    ctx.save();
    if (bullets[index].id === p1.id) {
      ctx.rotate(bullets[index].rotation + 90 * Math.PI / 180);
      ctx.beginPath();
      ctx.arc(+8, clY - bullets[index].y + 40, 7, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.drawImage(shell, -35, clY - bullets[index].y, shell.width * 2 / 3, shell.height * 2 / 3);
    } else if (bullets[index].id === enemy.id) {
      ctx.translate(enemy.x - clX, enemy.y - clY);

      ctx.rotate(bullets[index].rotation + 90 * Math.PI / 180);

      ctx.drawImage(shell, -35, enemy.y - bullets[index].y, shell.width * 2 / 3, shell.height * 2 / 3);

      if (enemy.reload <= 400 && enemy.reload > 393) {
        ctx.drawImage(flash1, -60, -200);
      } else if (enemy.reload <= 393 && enemy.reload > 386) {
        ctx.drawImage(flash2, -60, -200);
      } else if (enemy.reload <= 386 && enemy.reload > 376) {
        ctx.drawImage(flash3, -60, -200);
      }
    } else {
      ctx.restore();
      break;
    }
    ctx.restore();
    bullets.splice(index, 1);
  }
  if (!p1.dead || p1.respawn > 170) {
    // rotate the gun
    ctx.rotate(clRotation + 90 * Math.PI / 180);

    // draw the shooting animation
    // console.log(p1.reload)
    if (p1.reload <= 400 && p1.reload > 393) {

      ctx.drawImage(flash1, -60, -200);
    } else if (p1.reload <= 393 && p1.reload > 386) {
      ctx.drawImage(flash2, -60, -200);
    } else if (p1.reload <= 386 && p1.reload > 376) {
      ctx.drawImage(flash3, -60, -200);
    } else if (p1.reload > 0 && p1.reload < 10) {
      reloadText.style.display = "none";
    }

    // draw the player's gun
    ctx.drawImage(gun, -20, -73, gun.width * 2 / 3, gun.height * 2 / 3);
  }
  if (p1.dead) {
    var exx = -130,
      exy = -140;
    if (p1.respawn <= 200 && p1.respawn > 190) {
      ctx.drawImage(ex1, exx, exy);
    } else if (p1.respawn <= 190 && p1.respawn > 180) {
      ctx.drawImage(ex2, exx, exy);
    } else if (p1.respawn <= 180 && p1.respawn > 170) {
      ctx.drawImage(ex3, exx, exy);
    } else if (p1.respawn <= 170 && p1.respawn > 160) {
      ctx.drawImage(ex4, exx, exy);
    } else if (p1.respawn <= 160 && p1.respawn > 150) {
      ctx.drawImage(ex5, exx, exy);
    } else if (p1.respawn <= 150 && p1.respawn > 140) {
      ctx.drawImage(ex6, exx, exy);
    } else if (p1.respawn <= 140 && p1.respawn > 130) {
      ctx.drawImage(ex7, exx, exy);
    } else if (p1.respawn <= 130 && p1.respawn > 120) {
      ctx.drawImage(ex8, exx, exy);
    }
    p1.respawn -= 5;
    if (p1.respawn < 1) {
      p1.dead = false;
    }
  }
  ctx.restore();
  if (clientObject.timer <= 0) {
    ctx.save();
    clientObject.renderAlpha = (Math.min(clientObject.renderAlpha + 0.01), 0.7);
    ctx.beginPath();
    ctx.rect(-10, -10, 1300, 900);
    ctx.fillStyle = "rgba(0, 0, 0, " + clientObject.renderAlpha + ")";
    ctx.stroke();
    ctx.fill();
    ctx.restore();
    if (clientObject.renderAlpha == 0.7) {
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,1)";
      if (clientObject.winner) {
        ctx.translate(x - 300, y);
        ctx.font = '48px serif';
        ctx.fillText('Winner, Winner, Chicken dinner', 10, 50);

      } else {
        ctx.translate(x - 50, y);
        ctx.font = '48px serif';
        ctx.fillText('You lost!', 10, 50);
      }

      ctx.restore();
    }

  }
  //p1.reload = Math.max(p1.reload - 1, 0);
}
