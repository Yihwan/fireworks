//  === START CONFIGURATION ===
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
