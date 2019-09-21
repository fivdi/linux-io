'use strict';

const LinuxIO = require('../..');
const util = require('util');

function TinyBeagleBoneIO() {
  if (!(this instanceof TinyBeagleBoneIO)) {
    return new TinyBeagleBoneIO();
  }

  LinuxIO.call(this, {
    pins: [{
      ids: ['P8_7', 'GPIO66'],
      gpioNo: 66,
      modes: [0, 1]
    }, {
      ids: ['P8_8', 'GPIO67'],
      gpioNo: 67,
      modes: [0, 1]
    }, {
      ids: ['USR2'],
      ledPath: '/sys/class/leds/beaglebone:green:usr2',
      modes: [1]
    }, {
      ids: ['USR3'],
      ledPath: '/sys/class/leds/beaglebone:green:usr3',
      modes: [1]
    }],
    defaultI2cBus: 2,
    defaultLed: 'USR3'
  });

  setImmediate(function () {
    this.emit('connect');
    this.emit('ready');
  }.bind(this));
}
util.inherits(TinyBeagleBoneIO, LinuxIO);

module.exports = TinyBeagleBoneIO;

