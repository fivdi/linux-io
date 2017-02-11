'use strict';

var five = require('johnny-five');
var TinyChipIO = require('./tiny-chip-io');

var board = new five.Board({
  io: new TinyChipIO()
});

board.on('ready', function() {
  var writesPerSecond,
    time,
    i;

  this.pinMode(1013, five.Pin.OUTPUT);

  time = process.hrtime();

  for (i = 1; i <= 10000; i += 1) {
    this.digitalWrite(1013, i & 1);
  }

  time = process.hrtime(time);
  writesPerSecond = Math.floor(i / (time[0] + time[1] / 1E9));

  console.log('writes per second', writesPerSecond);
});

