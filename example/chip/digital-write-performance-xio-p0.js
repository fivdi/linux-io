'use strict';

const five = require('johnny-five');
const TinyChipIO = require('./tiny-chip-io');

const board = new five.Board({
  io: new TinyChipIO()
});

board.on('ready', function() {
  let writesPerSecond;
  let time;
  let i;

  this.pinMode('XIO-P0', five.Pin.OUTPUT);

  time = process.hrtime();

  for (i = 1; i <= 10000; i += 1) {
    this.digitalWrite('XIO-P0', i & 1);
  }

  time = process.hrtime(time);
  writesPerSecond = Math.floor(i / (time[0] + time[1] / 1E9));

  console.log('writes per second', writesPerSecond);
});

