'use strict';

const BoardIO = require('board-io');
const i2cBus = require('i2c-bus');
const mutexify = require('mutexify');
const Gpio = require('onoff').Gpio;
const util = require('util');
const Led = require('./led');

const DEFAULT_SAMPLING_INTERVAL = 5;

function constrain(value, low, high) {
  return Math.max(Math.min(value, high), low);
}

function LinuxIO(options) {
  if (!(this instanceof LinuxIO)) {
    return new LinuxIO(options);
  }

  BoardIO.call(this);

  options = options || {};

  this.name = options.name || 'Linux-IO';
  this.defaultLed = options.defaultLed;
  this.aref = options.aref;
  this.vref = options.vref;

  this._samplingInterval = typeof(options.samplingInterval) !== 'undefined' ?
    options.samplingInterval : DEFAULT_SAMPLING_INTERVAL;
  this._digitalReports = [];
  this._digitalReportsTimeoutId = 0;
  this._analogReports = [];
  this._analogReportsTimeoutId = 0;
  this._pingReadLock = mutexify();
  this._addressToBus = {};
  this._defaultI2cBus = options.defaultI2cBus;
  this._i2cBuses = {};
  this._pinsById = {};

  if (options.pins) {
    options.pins.forEach(function (pin, index) {
      const pinData = {
        index: index,
        supportedModes: pin.modes.slice(0),
        mode: this.MODES.UNKNOWN,
        report: 0,
        analogChannel: typeof pin.analogChannel === 'number' ? pin.analogChannel : 127,
        custom: typeof pin.custom === 'undefined' ? {} : pin.custom
      };

      this._pins[index] = pinData;

      if (Array.isArray(pin.ids)) {
        pin.ids.forEach(function (id) {
          this._pinsById[id] = pinData;
        }.bind(this));
      }

      if (typeof pin.gpioNo === 'number') {
        pinData.gpioNo = pin.gpioNo;
      }

      if (typeof pin.ledPath === 'string') {
        pinData.ledPath = pin.ledPath;
        pinData.isLed = true;
      } else {
        pinData.isLed = false;
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
  const pinData = this._pins[this.normalize(pin)];

  if (pinData.mode !== mode) {
    if (pinData.mode !== this.MODES.UNKNOWN) {
      throw new Error('Mode can not be changed');
    }

    if (pinData.supportedModes.indexOf(mode) === -1) {
      throw new Error('Mode ' + mode + ' is not supported');
    }

    if (mode === this.MODES.INPUT) {
      this._pinModeInput(pinData);
    } else if (mode === this.MODES.OUTPUT) {
      if (pinData.isLed) {
        this._pinModeLed(pinData);
      } else {
        this._pinModeOutput(pinData);
      }
    } else if (mode === this.MODES.ANALOG) {
      this._pinModeAnalog(pinData);
    } else if (mode === this.MODES.PWM) {
      this._pinModePwm(pinData);
    } else if (mode === this.MODES.SERVO) {
      this._pinModeServo(pinData);
    } else {
      throw new Error('Mode ' + mode + ' is not supported');
    }

    pinData.mode = mode;
  }

  return this;
};

LinuxIO.prototype.digitalRead = function(pin, handler) {
  const pinIndex = this.normalize(pin);
  const pinData = this._pins[pinIndex];
  const event = 'digital-read-' + pinIndex;

  if (pinData.mode !== this.MODES.INPUT) {
    this.pinMode(pin, this.MODES.INPUT);
  }

  pinData.report = 1;

  this._digitalReports[pinIndex] = {
    pinData: pinData,
    event: event
  };

  this.on(event, handler);

  if (!this._digitalReportsTimeoutId) {
    this._digitalReportsTimeoutId = setTimeout(
      this._digitalReportsTick.bind(this),
      this._samplingInterval
    );
  }

  return this;
};

LinuxIO.prototype.digitalWrite = function(pin, value) {
  const pinData = this._pins[this.normalize(pin)];

  if (pinData.mode === this.MODES.INPUT) {
    if (value) {
      this._enablePullUpResistor(pinData);
    } else {
      this._enablePullDownResistor(pinData);
    }
  } else {
    if (pinData.mode !== this.MODES.OUTPUT) {
      this.pinMode(pin, this.MODES.OUTPUT);
    }

    if (pinData.isLed) {
      this._digitalWriteLedSync(pinData, value);
    } else {
      this._digitalWriteSync(pinData, value);
    }

    pinData.value = value;
  }

  return this;
};

LinuxIO.prototype.analogRead = function(pin, handler) {
  const pinIndex = this.normalize(pin);
  const pinData = this._pins[pinIndex];
  const event = 'analog-read-' + pinIndex;

  if (pinData.mode !== this.MODES.ANALOG) {
    this.pinMode(pin, this.MODES.ANALOG);
  }

  pinData.report = 1;

  this._analogReports[pinIndex] = {
    pinData: pinData,
    event: event
  };

  this.on(event, handler);

  if (!this._analogReportsTimeoutId) {
    this._analogReportsTimeoutId = setTimeout(
      this._analogReportsTick.bind(this),
      this._samplingInterval
    );
  }

  return this;
};

LinuxIO.prototype.pwmWrite = function(pin, value) {
  const pinData = this._pins[this.normalize(pin)];

  if (pinData.mode !== this.MODES.PWM) {
    this.pinMode(pin, this.MODES.PWM);
  }

  this._pwmWriteSync(pinData, value);

  pinData.value = value;

  return this;
};

LinuxIO.prototype.analogWrite = LinuxIO.prototype.pwmWrite;

LinuxIO.prototype.servoConfig = function(pin, min, max) {
  const pinData = this._pins[this.normalize(pin)];

  if (pinData.mode !== this.MODES.SERVO) {
    this.pinMode(pin, this.MODES.SERVO);
  }

  if (!Number.isInteger(min)) {
    throw new Error('min value for a servo must be an integer');
  }

  if (!Number.isInteger(max)) {
    throw new Error('max value for a servo must be an integer');
  }

  // 544 is a magic number from the arduino servo library
  if (min < 544) {
    throw new Error('min value for a servo must be >= 544');
  }

  pinData.servoConfig.min = min;
  pinData.servoConfig.max = max;

  return this;
};

LinuxIO.prototype.servoWrite = function(pin, value) {
  const pinData = this._pins[this.normalize(pin)];

  if (pinData.mode !== this.MODES.SERVO) {
    this.pinMode(pin, this.MODES.SERVO);
  }

  // value < 544 implies degrees
  // value >= 544 implies microseconds
  // 544 is a magic number from the arduino servo library
  if (value < 544) {
    value = constrain(value, 0, 180);
  } else {
    value = constrain(
      value, pinData.servoConfig.min, pinData.servoConfig.max
    );
  }

  this._servoWriteSync(pinData, value);

  pinData.value = value;

  return this;
};

LinuxIO.prototype.pingRead = function(options, handler) {
  const pinIndex = this.normalize(options.pin);
  const pinData = this._pins[pinIndex];
  const event = 'ping-read-' + pinIndex;

  if (pinData.supportedModes.indexOf(this.MODES.INPUT) === -1 ||
      pinData.supportedModes.indexOf(this.MODES.OUTPUT) === -1) {
    throw new Error('Pin for pingRead must support INPUT and OUTPUT modes');
  }

  this.once(event, handler);

  if (pinData.report === 0) {
    pinData.report = 1;

    // If an attempt is made to measure proximity with two or more HC-SR04
    // sensors concurrently the sound pulses from the different sensors can
    // interfere with each other. The lock here prevents this from happening.
    this._pingReadLock(function (release) {
      // Note that the _pingRead callback does not have an err argument. If
      // _pingRead can't measure proximity it calls the callback with the
      // microseconds argument set to 0.
      this._pingRead(pinData, function(microseconds) {
        pinData.value = microseconds;

        this.emit(event, microseconds);

        pinData.report = 0;

        release();
      }.bind(this));
    }.bind(this));
  }

  return this;
};

LinuxIO.prototype.i2cConfig = function(options) {
  // note that there's a design flaw here
  // two devices with the same address on different buses doesn't work
  // see https://github.com/rwaldron/io-plugins/issues/13

  // options.address is _always_ sent by all I2C component classes in
  // Johnny-Five
  const address = options.address;

  // options.bus is optional
  const bus = typeof(options.bus) !== 'undefined' ? options.bus : this._defaultI2cBus;

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
  const i2c = this._i2cBuses[this._addressToBus[address]];

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

  const buffer = Buffer.from([cmdRegOrData].concat(inBytes));

  // only write if bytes provided
  if (buffer.length) {
    i2c.i2cWriteSync(address, buffer.length, buffer);
  }
  return this;
};

LinuxIO.prototype.i2cWriteReg = function(address, register, byte) {
  const i2c = this._i2cBuses[this._addressToBus[address]];

  i2c.writeByteSync(address, register, byte);

  return this;
};

LinuxIO.prototype.i2cRead = function(address, register, size, handler) {
  // fix arguments if called with Firmata.js API
  if (arguments.length === 3 &&
      typeof register === 'number' &&
      typeof size === 'function') {
    handler = size;
    size = register;
    register = null;
  }

  const continuousRead = function() {
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
      typeof register === 'number' &&
      typeof size === 'function') {
    handler = size;
    size = register;
    register = null;
  }

  const event = 'I2C-reply' + address + '-' + (register !== null ? register : 0);

  const afterRead = function (err, bytesRead, buffer) {
    if (err) {
      return this.emit('error', err);
    }

    // convert buffer to an Array before emit
    this.emit(event, Array.prototype.slice.call(buffer));
  }.bind(this);

  if (typeof handler === 'function') {
    this.once(event, handler);
  }

  const i2c = this._i2cBuses[this._addressToBus[address]];
  const data = Buffer.alloc(size);

  if (register !== null) {
    i2c.readI2cBlock(address, register, size, data, afterRead);
  } else {
    i2c.i2cRead(address, size, data, afterRead);
  }

  return this;
};

LinuxIO.prototype._digitalReportsTick = function() {
  this._digitalReports.forEach(function (report) {
    const value = this._digitalReadSync(report.pinData);

    if (value !== report.pinData.value) {
      report.pinData.value = value;
      this.emit(report.event, value);
    }
  }.bind(this));

  this._digitalReportsTimeoutId = setTimeout(
    this._digitalReportsTick.bind(this),
    this._samplingInterval
  );
};

LinuxIO.prototype._analogReportsTick = function() {
  const reports = this._analogReports.filter(function (report) {
      return report;
    });
  let reportsProcessed = 0;

  reports.forEach(function (report) {
    this._analogRead(report.pinData, function (err, value) {
      if (err) {
        this.emit('error', err);
      } else {
        if (value !== report.pinData.value) {
          report.pinData.value = value;
          this.emit(report.event, value);
        }
      }

      reportsProcessed += 1;

      if (reportsProcessed === reports.length) {
        this._analogReportsTickTimeoutId = setTimeout(
          this._analogReportsTick.bind(this),
          this._samplingInterval
        );
      }
    }.bind(this));
  }.bind(this));
};

LinuxIO.prototype._pinModeInput = function(pinData) {
  pinData.gpio = new Gpio(pinData.gpioNo, 'in');
};

LinuxIO.prototype._pinModeOutput = function(pinData) {
  pinData.gpio = new Gpio(pinData.gpioNo, 'out');
};

LinuxIO.prototype._pinModeLed = function(pinData) {
  pinData.led = new Led(pinData.ledPath);
};

LinuxIO.prototype._pinModeAnalog = function(pinData) {
  throw new Error('ANALOG mode is not supported');
};

LinuxIO.prototype._pinModePwm = function(pinData) {
  throw new Error('PWM mode is not supported');
};

LinuxIO.prototype._pinModeServo = function(pinData) {
  throw new Error('SERVO mode is not supported');
};

LinuxIO.prototype._enablePullUpResistor = function(pinData) {
  throw new Error('Enable pull-up resistor not supported');
};

LinuxIO.prototype._enablePullDownResistor = function(pinData) {
  throw new Error('Enable pull-down resistor not supported');
};

LinuxIO.prototype._digitalReadSync = function(pinData) {
  return pinData.gpio.readSync();
};

LinuxIO.prototype._digitalWriteSync = function(pinData, value) {
  pinData.gpio.writeSync(value);
};

LinuxIO.prototype._digitalWriteLedSync = function(pinData, value) {
  if (value) {
    pinData.led.on();
  } else {
    pinData.led.off();
  }
};

LinuxIO.prototype._analogRead = function(pinData, callback) {
  throw new Error('analogRead is not supported');
};

LinuxIO.prototype._pwmWriteSync = function(pinData, value) {
  throw new Error('pwmWrite is not supported');
};

LinuxIO.prototype._servoWriteSync = function(pinData, value) {
  throw new Error('servoWrite is not supported');
};

LinuxIO.prototype._pingRead = function(pinData, callback) {
  throw new Error('pingRead is not supported');
};

module.exports = LinuxIO;

