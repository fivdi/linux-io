'use strict';

var five = require('johnny-five');
var TinyRaspberryPiIO = require('./tiny-raspberry-pi-io');

var board = new five.Board({
  io: new TinyRaspberryPiIO()
});

board.on('ready', function() {
  var led = new five.Led(17);
  var button = new five.Button(4);

  button.on('down', function() {
    led.on();
  });

  button.on('up', function() {
    led.off();
  });
});

