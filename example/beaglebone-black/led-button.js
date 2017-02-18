'use strict';

var five = require('johnny-five');
var TinyBeagleBoneIO = require('./tiny-beaglebone-io');

var board = new five.Board({
  io: new TinyBeagleBoneIO()
});

board.on('ready', function() {
  var led = new five.Led('GPIO46');
  var button = new five.Button('GPIO47');

  button.on('down', function() {
    led.on();
  });

  button.on('up', function() {
    led.off();
  });
});

