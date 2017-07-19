'use strict';

const C = 0.33;
const R1 = 1000;
const B = 3800.0;
const R0 = 1000.0;

// wiring-pi is not upto date with wiring and kernel verions
const wpi = require('wiringpi-node');
const sleep = require('sleep');

function Sensor(options) {
    wpi.setup('wpi');
    this.thermPin = options.ThermPin; //a pin
    this.capPin = options.CapPin; //b pin
}

Sensor.prototype.init = function (callback) {
    // nothing todo
    callback();
}

Sensor.prototype.read = function (callback) {
    var n = 10;
    var total = 0;
    for (var i = 0; i < n; i++) {
        total += this.readTempC();
    }
    var temp = total / n;
    callback(null, { temperature : temp});
}

Sensor.prototype.discharge = function () {
    wpi.pinMode(this.thermPin, wpi.INPUT);
    wpi.pinMode(this.capPin, wpi.OUTPUT);
    wpi.digitalWrite(this.capPin, 0);
    wpi.delay(10);
}

Sensor.prototype.chargeTime = function () {
    wpi.pinMode(this.thermPin, wpi.OUTPUT);
    wpi.pinMode(this.capPin, wpi.INPUT);
    wpi.digitalWrite(this.thermPin, 1);

    var t1 = Date.now() / 1000;
    while (!wpi.digitalRead(this.capPin)) {
    }
    var t2 = Date.now() / 1000;
    var result = (t2 - t1) * 1000000;
    return result;
}

Sensor.prototype.analogRead = function () {
    this.discharge();
    var t = this.chargeTime();
    this.discharge();
    return t;
}

Sensor.prototype.readResistance = function () {
    var n = 100;
    var total = 0;    
    for (var i = 0; i < n; i++) {
        total += this.analogRead();
    }
    var t = total / n;
    var bigT = t * 0.632 * 3.3;
    var r = (bigT / C) - R1;
    return r;
}

Sensor.prototype.readTempC = function () {
    var R = this.readResistance();
    var t0 = 273.15;
    var t25 = t0 + 25.0;
    var invT = 1 / t25 + 1 / B * Math.log(R / R0);
    var T = (1 / invT - t0);
    return T;
}

module.exports = Sensor;
