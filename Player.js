Player = function(params) {
  var self = {};
  self.x = 20;
  self.y = 20;
  self.speed_x = 0;
  self.speed_y = 0;
  self.max_speed = 10;
  self.id = "";
  self.pressingRight = false;
  self.pressingLeft = false;
  self.pressingUp = false;
  self.pressingDown = false;
  self.pressingAttack = false;
  self.mouseAngle = 0;
	self.mouseX = 0;
	self.mouseY = 0;
  self.hp = 10;
  self.max_hp = 10;
  self.score = 0;
  self.WIDTH; self.HEIGHT;
  if (params) {
    if(params.x)
      self.x = params.x;
    if(params.y)
      self.y = params.y;
    if(params.id)
      self.id = params.id;
  }

  self.update = function() {
    self.x += self.speed_x;
    self.y += self.speed_y;
  }
  self.getDistance = function(point) {
    return Math.sqrt(Math.pow(self.x-point.x, 2) + Math.pow(self.y-point.y, 2));
  }

  return self;
}
