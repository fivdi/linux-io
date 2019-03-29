'use strict';

const five = require('johnny-five');
const TinyRaspberryPiIO = require('./tiny-raspberry-pi-io');

const board = new five.Board({
  io: new TinyRaspberryPiIO()
});

board.on('ready', function() {
  const button = new five.Button('P1-7');

  button.on('down', function() {
    console.log('down');
  });

  button.on('up', function() {
    console.log('up');
  });
});

