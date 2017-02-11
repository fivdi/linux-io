'use strict';

var five = require('johnny-five');
var TinyRaspberryPiIO = require('./tiny-raspberry-pi-io');

var board = new five.Board({
  io: new TinyRaspberryPiIO()
});

board.on('ready', function() {
  var led = new five.Led(17);

  led.blink(500);
});

