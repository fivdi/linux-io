1.1.1 / May 01 2021
===================
  * drop support for node.js 8 and 13, add support for node.js 15 and 16
  * update dependencies

1.1.0 / Apr 25 2020
===================
  * update dependencies
  * drop support for node.js 6, add support for node.js 14

1.0.7 / Sep 22 2019
===================
  * update dependencies (onoff v5.0.0)

1.0.6 / Sep 21 2019
===================
  * switch from gpio 46 and 47 to 66 and 67 on beaglebone black

1.0.5 / Sep 21 2019
===================
  * drop support for node.js v4
  * update dependencies (i2c-bus v5.0.0)

1.0.4 / Sep 07 2019
===================

  * remove node 11 from build
  * update dependencies (i2c-bus v4.0.11, onoff v4.1.4)

1.0.3 / Apr 29 2019
===================

  * update dependencies (i2c-bus v4.0.9, onoff v4.1.1)
  * lint with jshint
  * add travis build

1.0.2 / Sep 30 2018
===================

  * update dependencies to support V8 7.0 (onoff v3.2.2, i2c-bus v4.0.2)
  * replace new Buffer with Buffer.from or Buffer.alloc

1.0.1 / Apr 07 2018
===================

  * update dependencies (onoff v3.0.2, i2c-bus v3.1.0)

1.0.0 / Feb 26 2018
===================

  * update dependencies (onoff v2.0.0, i2c-bus v3.0.0)
  * drop support for node.js v0.10, v0.12, v5 and v7

0.9.2 / Jan 21 2018
===================

  * update microsecond value with constrained microsecond value

0.9.1 / Jan 21 2018
===================

  * constrain microsecond value for servo pulses

0.9.0 / Jan 21 2018
===================

  * allow servowrite to receive degrees or microseconds

0.8.1 / Nov 27 2017
===================

  * access array with correct syntax

0.8.0 / Jul 16 2017
===================

  * remove error handling for _pingRead callback
  * update dependencies

0.7.1 / Jul 01 2017
===================

  * prevent concurrent pingReads on proximity sensors

0.7.0 / Jun 26 2017
===================

  * improve documentation
  * add support for enabling pull-up and pull-down resistors

0.6.3 / Jun 18 2017
===================

  * update dependencies

0.6.2 / May 29 2017
===================

  * automatically set pin mode when necessary
  * use Linux-IO as a default name

0.6.1 / May 01 2017
===================

  * update dependencies

0.6.0 / Apr 30 2017
===================

  * pingRead support added

0.5.7 / Apr 14 2017
===================

  * save value passed to pwmWrite and servoWrite in pin configuration object

0.5.6 / Apr 06 2017
===================

  * name property support added

0.5.5 / Apr 04 2017
===================

  * prevent pin mode changes

0.5.4 / Apr 03 2017
===================

  * verify that pin is configured correctly before usage

0.5.3 / Apr 02 2017
===================

  * error handling improved

0.5.2 / Mar 31 2017
===================

  * allow extensions to store custom pinData

0.5.1 / Mar 26 2017
===================

  * fix arguments passed to i2cRead if called with Firmata.js API

0.5.0 / Mar 10 2017
===================

  * support for ANALOG mode

0.4.0 / Feb 25 2017
===================

  * built-in led support

0.3.2 / Feb 22 2017
===================

  * simplify overriding of pinMode for digital io

0.3.1 / Feb 20 2017
===================

  * throw an error when an operation is not supported

0.3.0 / Feb 19 2017
===================

  * pinMode methods renamed

0.2.1 / Feb 19 2017
===================

  * use normalized pin index as a suffix for digital-read event name
  * simplify overriding of pinMode

0.2.0 / Feb 18 2017
===================

  * use mnemonic pin ids rather than numeric pin ids

0.1.1 / Feb 12 2017
===================

  * beaglebone black examples
  * upgrade to onoff v1.1.2 and i2c-bus 1.2.1

0.1.0 / Feb 11 2017
===================

  * raspberry pi examples
  * i2c accelerometer example
  * documentation

0.0.2 / Feb 09 2017
===================

  * simplify overriding of pwmWrite, servoConfig and servoWrite

0.0.1 / Feb 05 2017
===================

  * allow sampling interval to be configured
  * pinMode returns this rather than undefined
  * simplify overriding of digitalRead, digitalWrite and _tick

0.0.0 / Feb 05 2017
===================

  * initial release

