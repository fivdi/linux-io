'use strict';

const five = require('johnny-five');
const TinyBeagleBoneIO = require('./tiny-beaglebone-io');

const board = new five.Board({
  io: new TinyBeagleBoneIO()
});

board.on('ready', function() {
  const button = new five.Button('GPIO67');

  button.on('down', function() {
    console.log('down');
  });

  button.on('up', function() {
    console.log('up');
  });
});

