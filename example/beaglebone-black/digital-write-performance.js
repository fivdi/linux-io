'use strict';

const five = require('johnny-five');
const TinyBeagleBoneIO = require('./tiny-beaglebone-io');

const board = new five.Board({
  io: new TinyBeagleBoneIO()
});

board.on('ready', function() {
  let writesPerSecond;
  let time;
  let i;

  this.pinMode('GPIO66', five.Pin.OUTPUT);

  time = process.hrtime();

  for (i = 1; i <= 250000; i += 1) {
    this.digitalWrite('GPIO66', i & 1);
  }

  time = process.hrtime(time);
  writesPerSecond = Math.floor(i / (time[0] + time[1] / 1E9));

  console.log(writesPerSecond + ' digitalWrite calls per second');
});

