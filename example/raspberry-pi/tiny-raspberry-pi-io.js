'use strict';

const LinuxIO = require('../..'); 
const util = require('util');

function TinyRaspberryPiIO() {
  if (!(this instanceof TinyRaspberryPiIO)) {
    return new TinyRaspberryPiIO();
  }

  LinuxIO.call(this, {
    pins: [{
      ids: ['P1-7', 'GPIO4'],
      gpioNo: 4,
      modes: [0, 1]
    }, {
      ids: ['P1-11', 'GPIO17'],
      gpioNo: 17,
      modes: [0, 1]
    }, {
      ids: ['LED0'],
      ledPath: '/sys/class/leds/led0',
      modes: [1]
    }],
    defaultI2cBus: 1,
    defaultLed: 'LED0'
  });

  setImmediate(function () {
    this.emit('connect');
    this.emit('ready');
  }.bind(this));
}
util.inherits(TinyRaspberryPiIO, LinuxIO);

module.exports = TinyRaspberryPiIO;

