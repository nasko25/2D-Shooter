var socket = new WebSocket("ws://localhost:8080/index.js");

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
var bullets = [];

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
  this.id=0;
  this.x=0;
  this.y=0;
  this.speedY=0;
  this.speedX=0;
  this.rotate=0;
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
  if (p1.reload === 0) {
    var dx = ev.clientX + pageXOffset - 9 - point[0];
    var dy = ev.clientY + pageYOffset - 9 - point[1];
    var hyp = Math.sqrt(dx * dx + dy * dy);
    socket.send(JSON.stringify(["shoot", {id: p1.id, dx: dx, dy: dy}]));
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
    var dx = mouse[0] - point[0] - 9 - (window.innerWidth - canvas.width)/2,
      dy = mouse[1] - point[1] - 9,
      rot = Math.atan2(dy, dx);
    clientObject.rotate=rot;
    // p1.setrotation(rot);
    // render(ctx, 900, 600);
    socket.send(JSON.stringify(["mouse_move", {rotation:rot}]));
  }
});

//Movement listeners:
window.addEventListener('keypress', (e) => {

  if (event.repeat) { return; }

  if (e.code === 'KeyW') {
    clientObject.speedY=-10;
    socket.send(JSON.stringify(["key_press", "up"]));
  } else if (e.code === 'KeyD') {
    clientObject.speedX=10;
    socket.send(JSON.stringify(["key_press", "right"]));
  } else if (e.code === 'KeyS') {
    clientObject.speedY=10;
    socket.send(JSON.stringify(["key_press", "down"]));
  } else if (e.code === 'KeyA') {
    clientObject.speedX=-10;
    socket.send(JSON.stringify(["key_press", "left"]));
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === 'KeyW') {
    clientObject.speedY=0;
    socket.send(JSON.stringify(["key_up", "up"]));
  } else if (e.code === 'KeyD') {
    clientObject.speedX=0;
    socket.send(JSON.stringify(["key_up", "right"]));
  } else if (e.code === 'KeyS') {
    clientObject.speedY=0;
    socket.send(JSON.stringify(["key_up", "down"]));
  } else if (e.code === 'KeyA') {
    clientObject.speedX=0;
    socket.send(JSON.stringify(["key_up", "left"]));
  }
});

//END OF MOVEMENT LISTENERS



//Server Connection
socket.onmessage = function(data) {
  var message = JSON.parse(data.data);
  updated=true;
  if (message[0] === "init") {
    p1 = new Player(message[1].player);
    clientObject=new clientView(p1.id);
    
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

      p1.face();
    }

    else if (message[1].id === enemy.id){
      enemy.x = x;
      enemy.y = y;
      enemy.xSpeed = message[1].xSpeed;
      enemy.ySpeed = message[1].ySpeed;

      enemy.face();
    }
  }

  else if (message[0] === "mouse_move") {
    if (message[1].id === p1.id) {
      p1.rotation = message[1].rotation;
    }
    else if (message[1].id === enemy.id) {
      enemy.rotation = message[1].rotation;
    }
  }

  else if (message[0] === "shoot") {
    bullets.push({rotation: message[1].rotation, y: message[1].y, id: message[1].id});
    if (message[1].id === p1.id) {
      p1.reload = message[1].reload;
    }
    else if (message[1].id === enemy.id) {
      enemy.reload = message[1].reload;
    }
  }

  
}

socket.onclose = function() {
  console.log("closed");
}

//Client side rendering


var updated = false;
 var speed = setInterval(() => {
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
   if(updated){
   //Check if client differs from server:
   if(Math.abs(clientObject.x-p1.x)>3){
    clientObject.x=p1.x;
   }
   if(Math.abs(clientObject.y-p1.y)>3){
    clientObject.y=p1.y;
    console.log(" updateD: "+clientObject.y+" a "+clientObject.speedY);
   
  }
  if(clientObject.speedX!==p1.xSpeed){
    clientObject.speedX=p1.xSpeed;
  }
  if(clientObject.speedY!==p1.ySpeed){
    clientObject.speedY=p1.ySpeed;
  }
  updated=false;
   }
  
  render(ctx, 900, 600);
 }, 25);


// TODO function too big; extract smaller functions and call only them, not calling render() each time
function render(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);
  let clX=clientObject.x,clY=clientObject.y, clSpeedX=clientObject.speedX, clSpeedY=clientObject.speedY, clfacing = 0, clRotation=clientObject.rotate;
  // draw the background

  let x = canvas.width / 2,
    y = canvas.height / 2;
  ctx.drawImage(backgroundView, -clX, -clY);

  // draw the player
  ctx.save();
  ctx.translate(x, y);
  var index = 0;

  ctx.rotate(p1.facing + 90 * Math.PI / 180);

  if (clSpeedX !== 0 || clSpeedY !== 0) {

    ctx.drawImage(tracksImg, -65, 20, tracksImg.width * 2 / 3, tracksImg.height * 2 / 3);
    ctx.drawImage(tracksImg, -15, 20, tracksImg.width * 2 / 3, tracksImg.height * 2 / 3);
  }
  ctx.drawImage(hull, -85, -97, hull.width * 2 / 3, hull.height * 2 / 3);

  ctx.restore();

  // draw the enemy
  ctx.save();
  ctx.translate(enemy.x - clX + width/2 + 150, enemy.y-clY + height/2 + 100);
  ctx.rotate(enemy.facing + 90 * Math.PI / 180);
  if (enemy.xSpeed !== 0 || enemy.ySpeed !== 0) {

    ctx.drawImage(tracksImg, -65, 20, tracksImg.width * 2 / 3, tracksImg.height * 2 / 3);
    ctx.drawImage(tracksImg, -15, 20, tracksImg.width * 2 / 3, tracksImg.height * 2 / 3);
  }
  ctx.drawImage(hull, -85, -97, hull.width * 2 / 3, hull.height * 2 / 3);
  ctx.restore();

  // draw the enemy's gun
  ctx.save();
  ctx.translate(enemy.x - clX + width/2 + 150, enemy.y-clY + height/2 + 100);
  ctx.rotate(enemy.rotation + 90 * Math.PI / 180);
  ctx.drawImage(gun, -20, -73, gun.width * 2 / 3, gun.height * 2 / 3);
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
      ctx.drawImage(shell, -35, clY - bullets[index].y, shell.width * 2 / 3, shell.height * 2 / 3);
    }
    else if (bullets[index].id === enemy.id) {
      ctx.translate(enemy.x - clX, enemy.y-clY);

      ctx.rotate(bullets[index].rotation + 90 * Math.PI / 180);
      ctx.drawImage(shell, -35, enemy.y - bullets[index].y, shell.width * 2 / 3, shell.height * 2 / 3);

      if (enemy.reload <= 80 && enemy.reload > 78) {
        ctx.drawImage(flash1, -60, -200);
      } else if (enemy.reload <= 78 && enemy.reload > 74) {
        ctx.drawImage(flash2, -60, -200);
      } else if (enemy.reload <= 74 && enemy.reload > 70) {
        ctx.drawImage(flash3, -60, -200);
      }
    }
    else {
      ctx.restore();
      break;
    }
    ctx.restore();
    bullets.splice(index, 1);
  }

  // rotate the gun
  ctx.rotate(clRotation + 90 * Math.PI / 180);

  // draw the shooting animation
  if (p1.reload <= 80 && p1.reload > 78) {
    ctx.drawImage(flash1, -60, -200);
  } else if (p1.reload <= 78 && p1.reload > 74) {
    ctx.drawImage(flash2, -60, -200);
  } else if (p1.reload <= 74 && p1.reload > 70) {
    ctx.drawImage(flash3, -60, -200);
  }

  // draw the player's gun
  ctx.drawImage(gun, -20, -73, gun.width * 2 / 3, gun.height * 2 / 3);

  ctx.restore();
  //p1.reload = Math.max(p1.reload - 1, 0);
}
