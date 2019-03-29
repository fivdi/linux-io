'use strict';

const five = require('johnny-five');
const TinyRaspberryPiIO = require('./tiny-raspberry-pi-io');

const board = new five.Board({
  io: new TinyRaspberryPiIO()
});

board.on('ready', function() {
  const relay = new five.Relay('P1-11');

  relay.on();

  setTimeout(function () {
    relay.off();
  }, 500);
});

