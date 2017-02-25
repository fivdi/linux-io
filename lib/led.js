var fs = require('fs');

var ON = new Buffer('255'),
  OFF = new Buffer('0');

function Led(ledPath) {
  if (!(this instanceof Led)) {
    return new Led(ledPath);
  }

  this.brightnessFd = fs.openSync(ledPath + '/brightness', 'r+');
  fs.writeFileSync(ledPath + '/trigger', 'none');
}

Led.prototype.on = function() {
  this._brightness(ON);
}

Led.prototype.off = function() {
  this._brightness(OFF);
}

Led.prototype._brightness = function(buf) {
  fs.writeSync(this.brightnessFd, buf, 0, buf.length, 0);
};

module.exports = Led;

