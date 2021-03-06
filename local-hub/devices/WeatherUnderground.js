/* 
  // Device Type
  "WeatherUnderground":{ 
      "params":["null"],
      "data":{
        "temp_f" : "int",
        "sunriseHour" : "int",
        "sunriseMinute" : "int",
        "sunsetHour" : "int",
        "sunsetMinute" : "int"
      },
      "triggers":{
      },
      "actions":{
      }
    }
*/

var util = require('util');
var http = require('http');
var EventEmitter = require('events').EventEmitter;
var securityCredentials = require('../securityCredentials.js');

function WeatherUnderground(params) {
  // we need to store the reference of `this` to `self`, so that we can use the current context in the setTimeout (or any callback) functions
  // using `this` in the setTimeout functions will refer to those funtions, not the class
  var self = this;
  this.data = {};
  this.data.temp_f = -1;
  this.data.sunriseHour = -1;
  this.data.sunriseMinute = -1;
  this.data.sunsetHour = -1;
  this.data.sunsetMinute = -1;

  getWeatherUndergroundData();

  EventEmitter.call(this); // This allows for events to be emitted
  continualDataUpdate(180000); // Every 3 minutes
  this.dispose = function(){

  };
};

util.inherits(WeatherUnderground, EventEmitter);

var getWeatherUndergroundData = function() {
  var self = this;
  http.get("http://api.wunderground.com/api/"+securityCredentials.WeatherUndergroundKey+"/astronomy/forecast/conditions/q/autoip.json", function(res) {
    var data = '';
    //console.log("Got response: " + res.statusCode);
    res.on('data', function (chunk){
      data += chunk;
    });
    res.on('end', function(){
      var response = data; // This transfers data from the chunked version of Bytes to a JSON type
      var result = JSON.parse(response); // parses it into Object

      self.emit("weatherUndergroundDataReceived", result); // this gives an immediate result

      self.data = result;
      console.log(result);
      console.log(result.current_observation.temp_f);
      console.log(result.moon_phase.sunrise.hour);
      console.log(result.moon_phase.sunrise.minute);
      console.log(result.moon_phase.sunset.hour);
      console.log(result.moon_phase.sunset.minute);

      self.data.temp_f = result.current_observation.temp_f;
      self.data.sunriseHour = result.moon_phase.sunrise.hour;
      self.data.sunriseMinute = result.moon_phase.sunrise.minute;
      self.data.sunsetHour = result.moon_phase.sunset.hour;
      self.data.sunsetMinute = result.moon_phase.sunset.minute;

      for(var i=0;i<3;i++)
      {
        console.log(result.forecast.txt_forecast.forecastday[i].title);
        console.log(result.forecast.txt_forecast.forecastday[i].fcttext);
      }
    });
  }).on('error', function(e) {
     console.log("HTTP Request got error: " + e.message);
  });
};

var continualDataUpdate = function(milliseconds){
  setInterval(getWeatherUndergroundData(), milliseconds);
};

module.exports = WeatherUnderground;