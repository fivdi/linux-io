'use strict';

const five = require('johnny-five');
const TinyBeagleBoneIO = require('./tiny-beaglebone-io');

const board = new five.Board({
  io: new TinyBeagleBoneIO()
});

board.on('ready', function() {
  const led = new five.Led('GPIO66');
  const button = new five.Button('GPIO67');

  button.on('down', function() {
    led.on();
  });

  button.on('up', function() {
    led.off();
  });
});

