'use strict';

var five = require('johnny-five');
var TinyRaspberryPiIO = require('./tiny-raspberry-pi-io');

var board = new five.Board({
  io: new TinyRaspberryPiIO()
});

board.on('ready', function() {
  var writesPerSecond,
    time,
    i;

  this.pinMode(17, five.Pin.OUTPUT);

  time = process.hrtime();

  for (i = 1; i <= 1000000; i += 1) {
    this.digitalWrite(17, i & 1);
  }

  time = process.hrtime(time);
  writesPerSecond = Math.floor(i / (time[0] + time[1] / 1E9));

  console.log(writesPerSecond + ' digitalWrite calls per second');
});

