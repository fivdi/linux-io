'use strict';

var five = require('johnny-five');
var TinyChipIO = require('./tiny-chip-io');

var board = new five.Board({
  io: new TinyChipIO()
});

board.on('ready', function() {
  var led = new five.Led('XIO-P0');
  var button = new five.Button('XIO-P1');

  button.on('down', function() {
    led.on();
  });

  button.on('up', function() {
    led.off();
  });
});

