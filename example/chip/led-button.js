'use strict';

const five = require('johnny-five');
const TinyChipIO = require('./tiny-chip-io');

const board = new five.Board({
  io: new TinyChipIO()
});

board.on('ready', function() {
  const led = new five.Led('XIO-P0');
  const button = new five.Button('XIO-P1');

  button.on('down', function() {
    led.on();
  });

  button.on('up', function() {
    led.off();
  });
});

