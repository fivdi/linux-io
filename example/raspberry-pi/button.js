'use strict';

var five = require('johnny-five');
var TinyRaspberryPiIO = require('./tiny-raspberry-pi-io');

var board = new five.Board({
  io: new TinyRaspberryPiIO()
});

board.on('ready', function() {
  var button = new five.Button(4);

  button.on('down', function() {
    console.log('down');
  });

  button.on('up', function() {
    console.log('up');
  });
});

