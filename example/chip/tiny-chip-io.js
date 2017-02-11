'use strict';

var LinuxIO = require('../..'),
  util = require('util');

function TinyChipIO() {
  LinuxIO.call(this, {
    pins: [132, 1013, 1014],
    defaultI2cBus: 1
  });

  setImmediate(function () {
    this.emit('connect');
    this.emit('ready');
  }.bind(this));
}
util.inherits(TinyChipIO, LinuxIO);

module.exports = TinyChipIO;

