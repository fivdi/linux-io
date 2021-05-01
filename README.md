[![Build Status](https://travis-ci.org/fivdi/linux-io.svg?branch=master)](https://travis-ci.org/fivdi/linux-io)

# Linux-IO

Linux-IO is an extensible Linux
[IO Plugin](https://github.com/rwaldron/io-plugins) for
[Johnny-Five](https://github.com/rwaldron/johnny-five). It extends
[board-io](https://github.com/achingbrain/board-io) to provide Linux
implementations for the following features that IO Plugins can support:

 * Digital IO
   * Implementation based on the [GPIO sysfs interface](https://www.kernel.org/doc/Documentation/gpio/sysfs.txt) using [onoff](https://github.com/fivdi/onoff)
 * I2C
   * Implementation based on the [/dev interface](https://www.kernel.org/doc/Documentation/i2c/dev-interface) using [i2c-bus](https://github.com/fivdi/i2c-bus)
 * Built-in LEDs
   * Implementation based on the [LED sysfs interface](https://www.kernel.org/doc/Documentation/leds/leds-class.txt) using [led.js](https://github.com/fivdi/linux-io/blob/master/lib/led.js)

The initial motivation for implementing Linux-IO was to provide Linux
implementations of the I2C methods that Johnny-Five IO Plugins are required to
implement. Over the course of the last two years I was involved in adding I2C
functionality to a number of IO Plugins. In reality, more or less the same
code was added to each IO Plugin. The goal of Linux-IO is to make such code
reusable across Linux IO Plugins.

Linux-IO supports Node.js versions 10, 12, 14, 15 and 18.

## Installation

```
npm install linux-io
```

## Johnny-Five Features Supported

The Johnny-Five features supported by a platform are summarized in tables on
the [Platform Support](http://johnny-five.io/platform-support/) page. The
features supported by Linux-IO shown in the following table:

Feature | Support
:--- | :---
Analog Read | no
Digital Read | yes
Digital Write | yes
PWM | no
Servo | no
I2C | yes
One Wire | no
Stepper | no
Serial/UART | no
DAC | no
Ping | no

## Usage

Here's a minimalistic IO Plugin for the Raspberry Pi called
[TinyRaspberryPiIO](https://github.com/fivdi/linux-io/blob/master/example/raspberry-pi/tiny-raspberry-pi-io.js)
that allows digital IO on GPIO4 and GPIO17 and I2C serial bus access on I2C
bus 1. The built-in LED can also be used.

```js
var LinuxIO = require('linux-io'),
  util = require('util');

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
```

If a button is connected to GPIO4 and an LED is connected to GPIO17, the
following
[program](https://github.com/fivdi/linux-io/blob/master/example/raspberry-pi/led-button.js)
will turn the LED on when the button is pressed and turn
the LED off when the button is released.

```js
var five = require('johnny-five');
var TinyRaspberryPiIO = require('./tiny-raspberry-pi-io');

var board = new five.Board({
  io: new TinyRaspberryPiIO()
});

board.on('ready', function() {
  var led = new five.Led('GPIO17');
  var button = new five.Button('GPIO4');

  button.on('down', function() {
    led.on();
  });

  button.on('up', function() {
    led.off();
  });
});
```

If an ADXL345 accelerometer is connected to I2C bus 1, the following
[program](https://github.com/fivdi/linux-io/blob/master/example/raspberry-pi/i2c-accelerometer.js)
will print information provided by accelerometer.

```js
var five = require('johnny-five');
var TinyRaspberryPiIO = require('./tiny-raspberry-pi-io');

var board = new five.Board({
  io: new TinyRaspberryPiIO()
});

board.on('ready', function() {
  var accelerometer = new five.Accelerometer({
    controller: "ADXL345"
  });

  accelerometer.on("change", function() {
    console.log("accelerometer");
    console.log("  x            : ", this.x);
    console.log("  y            : ", this.y);
    console.log("  z            : ", this.z);
    console.log("  pitch        : ", this.pitch);
    console.log("  roll         : ", this.roll);
    console.log("  acceleration : ", this.acceleration);
    console.log("  inclination  : ", this.inclination);
    console.log("  orientation  : ", this.orientation);
    console.log("--------------------------------------");
  });
});
```

## Examples

Additional examples for the Raspberry Pi, BeagleBone Black and C.H.I.P can be
found in the
[example directory](https://github.com/fivdi/linux-io/tree/master/example).

## IO Plugins Based On Linux-IO

- BeagleBone Black
  - [BeagleBone-IO](https://github.com/julianduque/beaglebone-io)
- Raspberry Pi
  - [Pi-IO](https://github.com/fivdi/pi-io)

