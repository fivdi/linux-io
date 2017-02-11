'use strict';

var five = require('johnny-five');
var TinyRaspberryPiIO = require('./tiny-raspberry-pi-io');

// Light
var lux;

// Compass
var heading;
var bearing;

// Accelerometer
var x;
var y;
var z;

var eventCount = 0;
var ticks = 0;

var board = new five.Board({
  io: new TinyRaspberryPiIO()
});

board.on('ready', function() {
  // Light
  var light = new five.Light({
    controller: "TSL2561",
  });

  light.on("data", function() {
    eventCount += 1;
    lux = this.lux;
  });

  // Compass
  var compass = new five.Compass({
    controller: "HMC5883L"
  });

  compass.on("change", function() {
    eventCount += 1;
    heading = Math.floor(this.heading);
    bearing = this.bearing.name;
  });

  compass.on("data", function() {
    eventCount += 1;
    heading = Math.floor(this.heading);
    bearing = this.bearing.name;
  });

  // Accelerometer
  var accelerometer = new five.Accelerometer({
    controller: "ADXL345",
    bus: 1
  });

  accelerometer.on("change", function() {
    eventCount += 1;
    x = this.x;
    y = this.y;
    z = this.z;
  });

  // LED on the XIO-P0 pin
  var led = new five.Led(1013);

  // Button on the XIO-P1 pin
  var button = new five.Button(1014);

  // add event listeners for 'up' and 'down' events
  // turn LED on when button is down, LED off when button is up
  button.on('down', function() {
    eventCount += 1;
    console.log('down');
    led.on();
  });

  button.on('up', function() {
    eventCount += 1;
    console.log('up');
    led.off();
  });
});

setInterval(function () {
  console.log('--------------------');
  // Light
  console.log('Lux    : ' + lux);

  // Compass
  console.log('heading: ' + heading);
  console.log('bearing: ' + bearing);

  // Accelerometer
  console.log('x      : ' + x);
  console.log('y      : ' + y);
  console.log('z      : ' + z);

  console.log('events : ' + eventCount);
  eventCount = 0;

  console.log('ticks : ' + ticks);
  ticks = 0;
}, 1000);

setInterval(function () {
  ticks += 1;
});

