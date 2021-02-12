
var SrSensor = Class.extend({

  rom: undefined,
  value: undefined,
  unit: undefined,
  unitcomma: undefined,
  min: undefined,
  max: undefined,
  name: undefined,
  backgroundcolor: undefined,

  init: function(rom) {
    if (sensors[rom]) {
      this.rom = rom;
      this.unit = sensors[rom]['unit'];
      this.unitcomma = sensors[rom]['unitcomma'];
      this.backgroundcolor = sensors[rom]['backgroundcolor'];
      this.min = sensors[rom]['min'];
      this.max = sensors[rom]['max'];
      this.name = sensors[rom]['name'];
    } else {
      throw "Unbekannter Sensor";
    }
  },

  value() {
    if (sensors[this.rom].value === undefined) {
      return undefined;
    }
    return sensors[this.rom].value;
  },

  result_value(value) {
    if (value === undefined) {
      value = this.value();
    }
    if (value === undefined) {
      return undefined;
    }
    if (this.unitcomma > 0) {
      return value / Math.pow(10,this.unitcomma);
    } else {
      return value;
    }
  },

  display_value(result_value) {
    if (result_value === undefined) {
      result_value = this.result_value();
    }
    if (this.rom) {
      if (result_value !== undefined) {
        if (this.unit == 1) {
          return result_value + '&#8451;';
        } else {
          return result_value;
        }
      } else {
        return 'Sensor nicht gefunden!';
      }
    } else {
      return 'Unbekannter Sensor!';
    }
  }

});



  // "sensors", "Sensors configuration", [
  //   "sensor#X", "Sensor X, where X is rom code", [
  //     "active",     [ "Sensor is in use", "bool", 0 ],
  //     "device",     [ "Official device id, 0 = unknown, 1 = ds1820", "integer", 0 ],
  //     "unit",       [ "Unit of value, 0 = raw, 1 = celsius", "integer", 0 ],
  //     "customunit", [ "Custom unit description", "text" ],
  //     "unitcomma",  [ "Digits behind comma are part of the value", "integer", 0 ],
  //     "min",        [ "Minimum value possible", "integer", 0 ],
  //     "max",        [ "Maximum value possible", "integer", 1000 ],
  //     "offset",     [ "Sensor value offset", "integer", 0 ],
  //     "name",       [ "Name for sensor", "text" ],
  //     "months",     [ "Apply sensor behavior only to given months (else always)", "array(month)" ],
  //     "desiredmin", [ "Minimum desired value", "integer" ],
  //     "desiredmax", [ "Maximum desired value", "integer" ],
  //     "emails",     [ "Emails for alarm", "text" ],
  //     "status",     [ "Send status email every X hours (0 = deactivate)", "integer", 0 ],
  //     "pwm#X", "Setting for PWM X of sensor", [
  //       "domin",    [ "Set percentage if under desiredmin", "bool", 0 ],
  //       "domax",    [ "Set percentage if over desiredmax", "bool", 0 ],
  //       "percentmin",[ "PWM percentage to set under desiredmin, is 0 or 100 for on/off", "integer", 0 ],
  //       "percentmax",[ "PWM percentage to set over desiredmax, is 0 or 100 for on/off", "integer", 0 ]
  //     ]
  //   ],
  //   "web",          [ "Web configuration for sensors", "json", "{}"]
  // ],