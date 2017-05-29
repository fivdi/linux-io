'use strict';

var five = require('johnny-five');
var TinyBeagleBoneIO = require('./tiny-beaglebone-io');

var board = new five.Board({
  io: new TinyBeagleBoneIO()
});

board.on('ready', function() {
  var relay = new five.Relay('GPIO46');

  relay.on();

  setTimeout(function () {
    relay.off();
  }, 500);
});

