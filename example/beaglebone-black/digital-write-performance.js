'use strict';

var five = require('johnny-five');
var TinyBeagleBoneIO = require('./tiny-beaglebone-io');

var board = new five.Board({
  io: new TinyBeagleBoneIO()
});

board.on('ready', function() {
  var writesPerSecond,
    time,
    i;

  this.pinMode('GPIO46', five.Pin.OUTPUT);

  time = process.hrtime();

  for (i = 1; i <= 250000; i += 1) {
    this.digitalWrite('GPIO46', i & 1);
  }

  time = process.hrtime(time);
  writesPerSecond = Math.floor(i / (time[0] + time[1] / 1E9));

  console.log(writesPerSecond + ' digitalWrite calls per second');
});

