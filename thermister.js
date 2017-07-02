'use strict';

const C = 0.33;
const R1 = 1000;
const B = 3800.0;
const R0 = 1000.0;

// wiring-pi is not upto date with wiring and kernel verions
const wpi = require('wiringpi-node');
const sleep = require('sleep');

function Sensor(options, wpi) {
    this.wpi = wpi
    this.thermPin = options.ThermPin; //a pin
    this.capPin = options.CapPin; //b pin
}

Sensor.prototype.init = function (callback) {
    // nothing todo
    callback();
}

Sensor.prototype.read = function (callback) {
    this.readTempC()
        .then((data) => {
            data.temperature = data;
            callback(null, data);
        })
        .catch(callback);
}

Sensor.prototype.discharge = function () {
    this.wpi.pinMode(this.thermPin, wpi.INPUT);
    this.wpi.pinMode(this.capPin, wpi.OUTPUT);
    this.wpi.digitalWrite(this.capPin, 0);
    sleep.msleep(100);
}

Sensor.prototype.chargeTime = function () {
    this.wpi.pinMode(this.thermPin, wpi.OUTPUT);
    this.wpi.pinMode(this.capPin, wpi.INPUT);
    this.wpi.digitalWrite(this.thermPin, 1);
    var t1 = Date.now() / 1000;
    while (!this.wpi.digitalRead(this.capPin)) {
        console.log("looping");
        continue;
    }
    var t2 = Date.now() / 1000;
    var result = (t2 - t1) * 1000000;
    console.log("chargetime: " + result);
    return result;
}

Sensor.prototype.analogRead = function () {
    this.discharge();
    var t = this.chargeTime();
    this.discharge();
    return t;
}

Sensor.prototype.readResistance = function () {
    var n = 10;
    var total = 0;
    for (var i = 0; i < n; i++) {
        total += this.analogRead();
    }
    console.log("total: " + total); 
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
    console.log("temp: " + T);
    return T;
}

module.exports = Sensor;
