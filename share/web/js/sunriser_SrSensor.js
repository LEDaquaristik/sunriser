
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
