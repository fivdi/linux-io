'use strict';

const five = require('johnny-five');
const TinyRaspberryPiIO = require('./tiny-beaglebone-io');

const board = new five.Board({
  io: new TinyRaspberryPiIO()
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
