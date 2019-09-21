'use strict';

const five = require('johnny-five');
const TinyBeagleBoneIO = require('./tiny-beaglebone-io');

const board = new five.Board({
  io: new TinyBeagleBoneIO()
});

board.on('ready', function() {
  const relay = new five.Relay('GPIO66');

  relay.on();

  setTimeout(function () {
    relay.off();
  }, 500);
});

