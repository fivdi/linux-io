'use strict';

var five = require('johnny-five');
var TinyBeagleboneIO = require('./tiny-beaglebone-io');

var board = new five.Board({
  io: new TinyBeagleboneIO()
});

board.on('ready', function() {
  var led2 = new five.Led('USR2'),
    led3 = new five.Led('USR3');

  led2.blink(500);
  led3.blink(500);
});

