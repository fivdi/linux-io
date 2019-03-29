'use strict';

const five = require('johnny-five');
const TinyChipIO = require('./tiny-chip-io');

const board = new five.Board({
  io: new TinyChipIO()
});

board.on('ready', function() {
  const button = new five.Button('XIO-P1');

  button.on('down', function() {
    console.log('down');
  });

  button.on('up', function() {
    console.log('up');
  });
});

