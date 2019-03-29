'use strict';

const five = require('johnny-five');
const TinyChipIO = require('./tiny-chip-io');

const board = new five.Board({
  io: new TinyChipIO()
});

board.on('ready', function() {
  const relay = new five.Relay('XIO-P0');

  relay.on();

  setTimeout(function () {
    relay.off();
  }, 500);
});

