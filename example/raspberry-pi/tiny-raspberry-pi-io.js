'use strict';

var LinuxIO = require('../..'),
  util = require('util');

function TinyRaspberryPiIO() {
  LinuxIO.call(this, {
    pins: [4, 17],
    defaultI2cBus: 1
  });

  setImmediate(function () {
    this.emit('connect');
    this.emit('ready');
  }.bind(this));
}
util.inherits(TinyRaspberryPiIO, LinuxIO);

module.exports = TinyRaspberryPiIO;

