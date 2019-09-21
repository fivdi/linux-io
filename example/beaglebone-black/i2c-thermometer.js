'use strict';

const five = require('johnny-five');
const TinyBeagleBoneIO = require('./tiny-beaglebone-io');

const board = new five.Board({
  io: new TinyBeagleBoneIO()
});

board.on('ready', function() {
  const thermometer = new five.Thermometer({
    controller: 'MCP9808'
  });

  thermometer.on('change', function() {
    console.log('celsius: %d', this.C);
    console.log('fahrenheit: %d', this.F);
    console.log('kelvin: %d', this.K);
  });
});

