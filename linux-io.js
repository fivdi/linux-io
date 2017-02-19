'use strict';

var BoardIO = require('board-io'),
  i2cBus = require('i2c-bus'),
  Gpio = require('onoff').Gpio,
  util = require('util');

var DEFAULT_SAMPLING_INTERVAL = 5;

function LinuxIO(options) {
  var i;

  if (!(this instanceof LinuxIO)) {
    return new LinuxIO(options);
  }

  BoardIO.call(this);

  options = options || {};

  this._samplingInterval = typeof(options.samplingInterval) !== 'undefined' ?
    options.samplingInterval : DEFAULT_SAMPLING_INTERVAL;
  this._reports = [];
  this._reportTimeoutId = 0;
  this._addressToBus = {};
  this._defaultI2cBus = options.defaultI2cBus;
  this._i2cBuses = {};
  this._pinsById = {};

  if (options.pins) {
    options.pins.forEach(function (pin, index) {
      var pinData = {
        index: index,
        supportedModes: pin.modes.slice(0),
        mode: this.MODES.UNKNOWN,
        report: 0,
        analogChannel: 127
      }

      this._pins[index] = pinData;

      if (Array.isArray(pin.ids)) {
        pin.ids.forEach(function (id) {
          this._pinsById[id] = pinData;
        }.bind(this));
      }

      if (typeof pin.gpioNo === 'number') {
        pinData.gpioNo = pin.gpioNo;
      }
    }.bind(this));
  }
}
util.inherits(LinuxIO, BoardIO);

LinuxIO.prototype.normalize = function(pin) {
  if (typeof pin === 'string') {
    return this._pinsById[pin].index;
  }

  return pin;
};

LinuxIO.prototype.pinMode = function(pin, mode) {
  var pinData = this._pins[this.normalize(pin)];

  if (mode === this.MODES.INPUT || mode === this.MODES.OUTPUT) {
    this._pinModeDigital(pinData, mode);
  } else if (mode === this.MODES.PWM) {
    this._pinModePwm(pinData);
  } else if (mode === this.MODES.SERVO) {
    this._pinModeServo(pinData);
  }

  return this;
};

LinuxIO.prototype.digitalRead = function(pin, handler) {
  var pinIndex = this.normalize(pin),
    pinData = this._pins[pinIndex],
    event = 'digital-read-' + pinIndex;

  pinData.report = 1;

  this._reports[pinIndex] = {
    pinData: pinData,
    event: event
  }

  this.on(event, handler);

  if (!this._reportTimeoutId) {
    this._reportTimeoutId = setTimeout(this._tick.bind(this), this._samplingInterval);
  }

  return this;
};

LinuxIO.prototype.digitalWrite = function(pin, value) {
  var pinData = this._pins[this.normalize(pin)];

  this._digitalWriteSync(pinData, value);
  pinData.value = value;

  return this;
};

LinuxIO.prototype.pwmWrite = function(pin, value) {
  this._pwmWriteSync(this._pins[this.normalize(pin)], value);

  return this;
};

LinuxIO.prototype.analogWrite = LinuxIO.prototype.pwmWrite;

LinuxIO.prototype.servoConfig = function(pin, min, max) {
  var pinData = this._pins(this.normalize(pin));

  /*if (pinData.mode !== this.MODES.SERVO) { // TODO - Is this ever needed?
    this.pinMode(pin, this.MODES.SERVO);
  }*/

  pinData.servoConfig.min = min;
  pinData.servoConfig.max = max;

  return this;
};

LinuxIO.prototype.servoWrite = function(pin, value) {
  var pinData = this._pins[this.normalize(pin)];

  /*if (pinData.mode !== this.MODES.SERVO) { // TODO - Is this ever needed?
    this.pinMode(pin, this.MODES.SERVO);
  }*/

  if (value < 0) {
    value = 0;
  } else if (value > 180) {
    value = 180;
  }

  this._servoWriteSync(pinData, value);

  return this;
};

LinuxIO.prototype.i2cConfig = function(options) {
  // note that there's a design flaw here
  // two devices with the same address on different buses doesn't work
  // see https://github.com/rwaldron/io-plugins/issues/13

  // options.address is _always_ sent by all I2C component classes in
  // Johnny-Five
  var address = options.address;

  // options.bus is optional
  var bus = typeof(options.bus) !== 'undefined' ? options.bus : this._defaultI2cBus;

  // associate the address to the bus
  if (!this._addressToBus.hasOwnProperty(address)) {
    this._addressToBus[address] = bus;
  }

  // create an i2c-bus object for the I2C bus
  if (!this._i2cBuses.hasOwnProperty(bus)) {
    this._i2cBuses[bus] = i2cBus.openSync(bus);
  }

  return this;
};

LinuxIO.prototype.i2cWrite = function(address, cmdRegOrData, inBytes) {
  var i2c = this._i2cBuses[this._addressToBus[address]];

  // if i2cWrite was used for an i2cWriteReg call...
  if (arguments.length === 3 &&
      !Array.isArray(cmdRegOrData) &&
      !Array.isArray(inBytes)) {
    return this.i2cWriteReg(address, cmdRegOrData, inBytes);
  }

  // fix arguments if called with Firmata.js API
  if (arguments.length === 2) {
    if (Array.isArray(cmdRegOrData)) {
      inBytes = cmdRegOrData.slice();
      cmdRegOrData = inBytes.shift();
    } else {
      inBytes = [];
    }
  }

  var buffer = new Buffer([cmdRegOrData].concat(inBytes));

  // only write if bytes provided
  if (buffer.length) {
    i2c.i2cWriteSync(address, buffer.length, buffer);
  }
  return this;
};

LinuxIO.prototype.i2cWriteReg = function(address, register, byte) {
  var i2c = this._i2cBuses[this._addressToBus[address]];

  i2c.writeByteSync(address, register, byte);

  return this;
};

LinuxIO.prototype.i2cRead = function(address, register, size, handler) {
  var continuousRead = function() {
    this.i2cReadOnce(address, register, size, function(bytes) {
      handler(bytes);
      setTimeout(continuousRead, this._samplingInterval);
    });
  }.bind(this);

  continuousRead();

  return this;
};

LinuxIO.prototype.i2cReadOnce = function(address, register, size, handler) {
  // fix arguments if called with Firmata.js API
  if (arguments.length === 3 &&
      typeof register === "number" &&
      typeof size === "function") {
    handler = size;
    size = register;
    register = null;
  }

  var event = "I2C-reply" + address + "-" + (register !== null ? register : 0);

  var afterRead = function (err, bytesRead, buffer) {
    if (err) {
      return this.emit("error", err);
    }

    // convert buffer to an Array before emit
    this.emit(event, Array.prototype.slice.call(buffer));
  }.bind(this);

  if (typeof handler === "function") {
    this.once(event, handler);
  }

  var i2c = this._i2cBuses[this._addressToBus[address]];
  var data = new Buffer(size);

  if (register !== null) {
    i2c.readI2cBlock(address, register, size, data, afterRead);
  } else {
    i2c.i2cRead(address, size, data, afterRead);
  }

  return this;
};

LinuxIO.prototype._tick = function() {
  this._reports.forEach(function (report) {
    var value = this._digitalReadSync(report.pinData);

    if (value !== report.pinData.value) {
      report.pinData.value = value;
      this.emit(report.event, value);
    }
  }.bind(this));

  this._reportTimeoutId = setTimeout(this._tick.bind(this), this._samplingInterval);
};

LinuxIO.prototype._pinModeDigital = function(pinData, mode) {
  var direction = mode === this.MODES.INPUT ? 'in' : 'out';

  if (!pinData.gpio) {
    pinData.gpio = new Gpio(pinData.gpioNo, direction);
  } else if (pinData.mode != mode) {
    pinData.gpio.setDirection(direction);
  }

  pinData.mode = mode;
};

LinuxIO.prototype._pinModePwm = function(pinData) {
};

LinuxIO.prototype._pinModeServo = function(pinData) {
};

LinuxIO.prototype._digitalReadSync = function(pinData) {
  return pinData.gpio.readSync();
};

LinuxIO.prototype._digitalWriteSync = function(pinData, value) {
  pinData.gpio.writeSync(value);
};

LinuxIO.prototype._pwmWriteSync = function(pinData, value) {
};

LinuxIO.prototype._servoWriteSync = function(pinData, value) {
};

module.exports = LinuxIO;

