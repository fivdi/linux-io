'use strict';

var five = require('johnny-five');
var TinyRaspberryPiIO = require('./tiny-raspberry-pi-io');

var board = new five.Board({
  io: new TinyRaspberryPiIO()
});

board.on('ready', function() {
  var relay = new five.Relay('P1-11');

  relay.on();

  setTimeout(function () {
    relay.off();
  }, 500);
});

