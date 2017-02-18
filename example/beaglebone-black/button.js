'use strict';

var five = require('johnny-five');
var TinyBeagleBoneIO = require('./tiny-beaglebone-io');

var board = new five.Board({
  io: new TinyBeagleBoneIO()
});

board.on('ready', function() {
  var button = new five.Button('GPIO47');

  button.on('down', function() {
    console.log('down');
  });

  button.on('up', function() {
    console.log('up');
  });
});

