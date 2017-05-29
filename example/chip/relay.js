'use strict';

var five = require('johnny-five');
var TinyChipIO = require('./tiny-chip-io');

var board = new five.Board({
  io: new TinyChipIO()
});

board.on('ready', function() {
  var relay = new five.Relay('XIO-P0');

  relay.on();

  setTimeout(function () {
    relay.off();
  }, 500);
});

