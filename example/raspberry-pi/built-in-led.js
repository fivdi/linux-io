'use strict';

const five = require('johnny-five');
const TinyRaspberryPiIO = require('./tiny-raspberry-pi-io');

const board = new five.Board({
  io: new TinyRaspberryPiIO()
});

board.on('ready', function() {
  const led = new five.Led('LED0');

  led.blink(500);
});

