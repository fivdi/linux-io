'use strict';

const five = require('johnny-five');
const TinyRaspberryPiIO = require('./tiny-raspberry-pi-io');

const board = new five.Board({
  io: new TinyRaspberryPiIO()
});

board.on('ready', function() {
  const accelerometer = new five.Accelerometer({
    controller: 'ADXL345'
  });

  accelerometer.on('change', function() {
    console.log('accelerometer');
    console.log('  x            : ', this.x);
    console.log('  y            : ', this.y);
    console.log('  z            : ', this.z);
    console.log('  pitch        : ', this.pitch);
    console.log('  roll         : ', this.roll);
    console.log('  acceleration : ', this.acceleration);
    console.log('  inclination  : ', this.inclination);
    console.log('  orientation  : ', this.orientation);
    console.log('--------------------------------------');
  });
});

