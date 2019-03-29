'use strict';

const five = require('johnny-five');
const TinyBeagleboneIO = require('./tiny-beaglebone-io');

const board = new five.Board({
  io: new TinyBeagleboneIO()
});

board.on('ready', function() {
  const led2 = new five.Led('USR2');
  const led3 = new five.Led('USR3');

  led2.blink(500);
  led3.blink(500);
});

