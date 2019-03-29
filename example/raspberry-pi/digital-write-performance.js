'use strict';

const five = require('johnny-five');
const TinyRaspberryPiIO = require('./tiny-raspberry-pi-io');

const board = new five.Board({
  io: new TinyRaspberryPiIO()
});

board.on('ready', function() {
  let writesPerSecond;
  let time;
  let i;

  this.pinMode('P1-11', five.Pin.OUTPUT);

  time = process.hrtime();

  for (i = 1; i <= 1000000; i += 1) {
    this.digitalWrite('P1-11', i & 1);
  }

  time = process.hrtime(time);
  writesPerSecond = Math.floor(i / (time[0] + time[1] / 1E9));

  console.log(writesPerSecond + ' digitalWrite calls per second');
});

