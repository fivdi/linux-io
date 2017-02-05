'use strict';

var five = require('johnny-five');
var TinyChipIO = require('./tiny-chip-io');

var board = new five.Board({
  io: new TinyChipIO()
});

board.on('ready', function() {
  var button = new five.Button(1014);

  button.on('down', function() {
    console.log('down');
  });

  button.on('up', function() {
    console.log('up');
  });
});

