//  === CONFIG ===
const FIREWORK_ACCELERATION = 1.05;
// Minimum firework brightness.
const FIREWORK_BRIGHTNESS_MIN = 50;
// Maximum firework brightness.
const FIREWORK_BRIGHTNESS_MAX = 70;
// Base speed of fireworks.
const FIREWORK_SPEED = 5;
// Base length of firework trails.
const FIREWORK_TRAIL_LENGTH = 3;
// Determine if target position indicator is enabled.
const FIREWORK_TARGET_INDICATOR_ENABLED = true;

// Minimum particle brightness.
const PARTICLE_BRIGHTNESS_MIN = 50;
// Maximum particle brightness.
const PARTICLE_BRIGHTNESS_MAX = 80;
// Base particle count per firework.
const PARTICLE_COUNT = 80;
// Minimum particle decay rate.
const PARTICLE_DECAY_MIN = 0.015;
// Maximum particle decay rate.
const PARTICLE_DECAY_MAX = 0.03;
// Base particle friction.
// Slows the speed of particles over time.
const PARTICLE_FRICTION = 0.95;
// Base particle gravity.
// How quickly particles move toward a downward trajectory.
const PARTICLE_GRAVITY = 0.7;
// Variance in particle coloration.
const PARTICLE_HUE_VARIANCE = 20;
// Base particle transparency.
const PARTICLE_TRANSPARENCY = 1;
// Minimum particle speed.
const PARTICLE_SPEED_MIN = 1;
// Maximum particle speed.
const PARTICLE_SPEED_MAX = 10;
// Base length of explosion particle trails.
const PARTICLE_TRAIL_LENGTH = 5;

// Alpha level that canvas cleanup iteration removes existing trails.
// Lower value increases trail duration.
const CANVAS_CLEANUP_ALPHA = 0.3;
// Hue change per loop, used to rotate through different firework colors.
const HUE_STEP_INCREASE = 0.5;

// Minimum number of ticks per manual firework launch.
const TICKS_PER_FIREWORK_MIN = 5;
// Minimum number of ticks between each automatic firework launch.
const TICKS_PER_FIREWORK_AUTOMATED_MIN = 20;
// Maximum number of ticks between each automatic firework launch.
const TICKS_PER_FIREWORK_AUTOMATED_MAX = 80;

// === LOCAL VARS ===

let canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let context = canvas.getContext('2d');

let fireworks = [];
let particles = [];

let mouseX, mouseY;

let isMouseDown = false;

let hue = 120;

let ticksFireworkAuto = 0;
let ticksFireworkManual = 0;

// === HELPERS ===
window.requestAnimFrame = (() => {
  return  window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          function(callback) {
            window.setTimeout(callback, 1000 / 60);
          };
})();

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function calculateDistance(aX, aY, bX, bY) {
  let xDistance = aX - bX;
  let yDistance = aY - bY;
  return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

// === EVENT LISTENERS ===

canvas.addEventListener('mousemove', (e) => {
  mouseX = e.pageX - canvas.offsetLeft;
  mouseY = e.pageY - canvas.offsetTop;
});

canvas.addEventListener('mousedown', (e) => {
  e.preventDefault();
  isMouseDown = true;
});

canvas.addEventListener('mouseup', (e) => {
  e.preventDefault();
  isMouseDown = false;
});

// === PROTOTYPES ===

function Firework(startX, startY, endX, endY) {
  this.x = startX;
  this.y = startY;

  this.startX = startX;
  this.startY = startY;

  this.endX = endX;
  this.endY = endY;

  this.distanceToEnd = calculateDistance(startX, startY, endX, endY);
  this.trail = [];

  this.trailLength = FIREWORK_TRAIL_LENGTH;

  while (this.trailLength--) {
    this.trail.push([this.x, this.y]);
  }

  this.angle = Math.atan2(endY - startY, endX - startX);

  this.speed = FIREWORK_SPEED;
  this.acceleration = FIREWORK_ACCELERATION;
  this.brightness = random(FIREWORK_BRIGHTNESS_MIN, FIREWORK_BRIGHTNESS_MAX);
  this.targetRadius = 2.5;
}

Firework.prototype.update = function(index) {
  this.trail.pop();

  this.trail.unshift([this.x, this.y]);

  if (FIREWORK_TARGET_INDICATOR_ENABLED) {
    if (this.targetRadius < 8) {
      this.targetRadius += 0.3;
    } else {
      this.targetRadius = 1;
    }
  }

  this.speed *= this.acceleration;

  let xVelocity = Math.cos(this.angle) * this.speed;
  let yVelocity = Math.sin(this.angle) * this.speed;

  this.distanceTraveled = calculateDistance(this.startX, this.startY, this.x + xVelocity, this.y + yVelocity);

  if(this.distanceTraveled >= this.distanceToEnd) {
    fireworks.splice(index, 1);
    createParticles(this.endX, this.endY);
  } else {
    this.x += xVelocity;
    this.y += yVelocity;
  }

};

Firework.prototype.draw = function() {
  context.beginPath();

  let trailEndX = this.trail[this.trail.length - 1][0];
  let trailEndY = this.trail[this.trail.length - 1][1];

  context.moveTo(trailEndX, trailEndY);
  context.lineTo(this.x, this.y);

  context.strokeStyle = `hsl(${hue}, 100%, ${this.brightness}%)`;

  context.stroke();

  if (FIREWORK_TARGET_INDICATOR_ENABLED) {
    context.beginPath();
    context.arc(this.endX, this.endY, this.targetRadius, 0, Math.PI * 2);
    context.stroke();
  }
};

function Particle(x, y) {
  this.x = x;
  this.y = y;

  this.angle = random(0, Math.PI * 2);

  this.friction = PARTICLE_FRICTION;

  this.gravity = PARTICLE_GRAVITY;

  this.hue = random(hue - PARTICLE_HUE_VARIANCE, hue + PARTICLE_HUE_VARIANCE);

  this.brightness = random(PARTICLE_BRIGHTNESS_MIN, PARTICLE_BRIGHTNESS_MAX);

  this.decay = random(PARTICLE_DECAY_MIN, PARTICLE_DECAY_MAX);

  this.speed = random(PARTICLE_SPEED_MIN, PARTICLE_SPEED_MAX);

  this.trail = [];

  this.trailLength = PARTICLE_TRAIL_LENGTH;

  while(this.trailLength--) {
      this.trail.push([this.x, this.y]);
  }

  this.transparency = PARTICLE_TRANSPARENCY;
}

Particle.prototype.update = function(index) {
  this.trail.pop();

  this.trail.unshift([this.x, this.y]);

  this.speed *= this.friction;

  this.x += Math.cos(this.angle) * this.speed;
  this.y += Math.sin(this.angle) * this.speed + this.gravity;

  this.transparency -= this.decay;

  if (this.transparency <= this.decay) {
    particles.slice(index, 1);
  }
};

Particle.prototype.draw = function() {
    context.beginPath();

    let trailEndX = this.trail[this.trail.length - 1][0];
    let trailEndY = this.trail[this.trail.length - 1][1];

    context.moveTo(trailEndX, trailEndY);
    context.lineTo(this.x, this.y);


    context.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.transparency})`;
    context.stroke();
};

function cleanCanvas() {

    context.globalCompositeOperation = 'destination-out';


    context.fillStyle = `rgba(0, 0, 0, ${CANVAS_CLEANUP_ALPHA})`;

    context.fillRect(0, 0, canvas.width, canvas.height);

    context.globalCompositeOperation = 'lighter';
}

function createParticles(x, y) {
    let particleCount = PARTICLE_COUNT;
    while(particleCount--) {

        particles.push(new Particle(x, y));
    }
}

function launchAutomatedFirework() {

    if(ticksFireworkAuto >= random(TICKS_PER_FIREWORK_AUTOMATED_MIN, TICKS_PER_FIREWORK_AUTOMATED_MAX)) {

        if(!isMouseDown) {

            let startX = canvas.width / 2;
            let startY = canvas.height;

            let endX = random(0, canvas.width);
            let endY = random(0, canvas.height / 2);

            fireworks.push(new Firework(startX, startY, endX, endY));

            ticksFireworkAuto = 0;
        }
    } else {
        ticksFireworkAuto++;
    }
}

function launchManualFirework() {
    if(ticksFireworkManual >= TICKS_PER_FIREWORK_MIN) {

        if(isMouseDown) {

            let startX = canvas.width / 2;
            let startY = canvas.height;

            let endX = mouseX;
            let endY = mouseY;

            fireworks.push(new Firework(startX, startY, endX, endY));

            ticksFireworkManual = 0;
        }
    } else {
        ticksFireworkManual++;
    }
}

// Update all active fireworks.
function updateFireworks() {
    for (let i = fireworks.length - 1; i >= 0; --i) {
        fireworks[i].draw();
        fireworks[i].update(i);
    }
}

// Update all active particles.
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; --i) {
        particles[i].draw();
        particles[i].update(i);
    }
}

function loop() {

    requestAnimationFrame(loop);
    hue += HUE_STEP_INCREASE;

    cleanCanvas();

    updateFireworks();
    updateParticles();

    launchAutomatedFirework();
    launchManualFirework();
}

window.onload = loop;
