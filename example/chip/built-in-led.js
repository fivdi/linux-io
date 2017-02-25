'use strict';

var five = require('johnny-five');
var TinyChipIO = require('./tiny-chip-io');

var board = new five.Board({
  io: new TinyChipIO()
});

board.on('ready', function() {
  var led = new five.Led('STATUS');

  led.blink(500);
});

