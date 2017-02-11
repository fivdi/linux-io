'use strict';

var LinuxIO = require('../..'),
  util = require('util');

function TinyBeagleBoneIO() {
  LinuxIO.call(this, {
    pins: [46, 47],
    defaultI2cBus: 2
  });

  setImmediate(function () {
    this.emit('connect');
    this.emit('ready');
  }.bind(this));
}
util.inherits(TinyBeagleBoneIO, LinuxIO);

module.exports = TinyBeagleBoneIO;

