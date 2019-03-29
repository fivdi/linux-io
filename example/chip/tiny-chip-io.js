'use strict';

const LinuxIO = require('../..');
const util = require('util');

function TinyChipIO() {
  if (!(this instanceof TinyChipIO)) {
    return new TinyChipIO();
  }

  LinuxIO.call(this, {
    pins: [{
      ids: ['XIO-P0', 'GPIO1013'],
      gpioNo: 1013,
      modes: [0, 1]
    }, {
      ids: ['XIO-P1', 'GPIO1014'],
      gpioNo: 1014,
      modes: [0, 1]
    }, {
      ids: ['CSID0', 'GPIO132'],
      gpioNo: 132,
      modes: [0, 1]
    }, {
      ids: ['STATUS'],
      ledPath: '/sys/class/leds/chip:white:status',
      modes: [1]
    }],
    defaultI2cBus: 1,
    defaultLed: 'STATUS'
  });

  setImmediate(function () {
    this.emit('connect');
    this.emit('ready');
  }.bind(this));
}
util.inherits(TinyChipIO, LinuxIO);

module.exports = TinyChipIO;

