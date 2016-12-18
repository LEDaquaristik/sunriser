
var SrField = Class.extend({

  name: undefined,
  id: undefined,
  label: undefined,
  desc: undefined,
  type: undefined,
  template: undefined,
  required: false,
  pre: false,
  validator: undefined,
  data: undefined,
  custom_init: function(){},

  html_field: function(){
    return $('#' + this.id);
  },
  error_field: function(){
    return $('#' + this.id + '_error');
  },
  html_value: function(){
    return this.html_field().val();
  },

  prepare: function(){},
  initjs: function(){},
  initchange: function(){
    this.old_value = this.value;
    this.html_field().on('change input',function(){
      sr_changed();
    });
  },
  transform: function(){
    this.value = this.html_value();
  },
  validate: function(){},
  text_value: function(){
    return this.value;
  },

  value: undefined,
  errors: undefined,

  init: function(config_param) {
    var config = {}; $.extend(config,config_param);
    if (typeof config.name !== 'undefined') {
      this.id = config.name.replace(/#/g,'_');
    }
    this.type_class = 'sr_type_' + config.type.replace(/\(/g,'_').replace(/\)/g,'_').replace(/,/g,'_').replace(/^_/,'').replace(/_$/,'');
    $.extend(this,config);
  },

  val: function(value) {
    if (value === null || typeof value === 'undefined') {
      this.value = sr_default(this.name);
    } else {
      this.value = value;
    }
  },

  has_errors: function() {
    return typeof this.errors !== 'undefined';
  },

  error: function(text) {
    if (!text) {
      text = "Unbekannter Fehler";
    }
    if (!this.errors) { this.errors = new Array(); }
    this.errors.push(text);
    this.error_field().trigger('error',text);
    this.error_field().append('<div class="error">' + text + '</div>');
  },

  error_required: function() {
    this.error("Dieses Feld muss ausgef&uuml;llt werden.")
  },

  reset: function() {
    this.errors = undefined;
  }

});

var SrField_Text = SrField.extend({

  template: 'text',

  transform: function() {
    var value = this.html_value();
    if (value === "") {
      this.value = undefined;
    } else if (typeof value === 'string') {
      if (value.length == 0) {
        if (this.required) {
          this.error_required();
        } else {
          this.value = undefined;
        }
      } else {
        this.value = value;
      }
    } else {
      this.error("Unbekannter Fehler (kein String)");
    }
  }

});

var SrField_Integer_Transform = function() {
  var value = this.html_value();
  console.log(value);
  if (value.length == 0 && !this.required) {
    this.value = undefined;
  } else {
    if (isNaN(value)) {
      this.error("Hier muss eine Zahl angegeben werden.");
    } else {
      this.value = parseInt(value);
    }
  }
};

var SrField_Integer = SrField_Text.extend({

  min: undefined,
  max: undefined,
  float_digits: 0,
  percent_sign: false,
  transform: SrField_Integer_Transform,
  display_value: function(val){
    var value = typeof val !== 'undefined' ? ( val ) : ( this.value || 0 );
    value = value / Math.pow(10,this.float_digits);
    if (this.percent_sign) {
      value = value + " %";
    }
    return value;
  },
  factor: function(){
    if (!this.min && !this.max) {
      return undefined;
    }
    var all = this.max - this.min;
    var part = this.value - this.min;
    return part / all;
  },
  initjs: function(){
    var self = this;
    var html_field = self.html_field();
    if (html_field.hasClass('sliders')) {
      html_field.hide();
      html_field.parent().find('.sliderbar').on('change',function(){
        var factor = $(this).data('value');
        var all = self.max - self.min;
        var diff = Math.floor(all * factor);
        var value = self.min + diff;
        html_field.val(value);
        html_field.trigger('change');
        html_field.parent().find('.slider_value').text(self.display_value(value));
      });
    }
  }

});

var SrField_Password = SrField_Text.extend({

  template: 'password'

});

var SrField_Hidden = SrField_Text.extend({

  pre: true,
  template: undefined, // will anyway not be used

});

var SrField_Checkbox = SrField.extend({

  template: 'checkbox',

  transform: function() {
    if (this.pre) {
      this.value = this.html_value() ? true : false;
    } else {
      this.value = this.html_field().prop("checked") ? true : false;
    }
  }

});

var SrField_JSON = SrField.extend({

  pre: true,
  template: undefined, // will anyway not be used

  prepare: function() {
    this.data = $.parseJSON(this.value);
  },

  transform: function() {
    if (this.getdata) {
      this.data = this.getdata(this.data);
    }
    this.value = JSON.stringify(this.data);
  }

});

var SrField_CSV = SrField_Text.extend({

  comma: ',',
  transform_value: function(value) { return value; },

  joined_value: function() {
    if (typeof this.value === 'undefined') {
      return "";
    }
    return this.value.join(this.comma);
  },

  text_value: function(){
    return this.joined_value();
  },

  transform: function() {
    var self = this;
    var value = self.html_value();
    if (typeof value === 'string') {
      if (value.length) {
        var arr = [];
        $.each(value.split(self.comma),function(i,val){
          arr.push(self.transform_value(val));
        });
        self.value = arr;
      } else {
        self.value = [];
      }
    } else {
      self.error("Unbekannter Fehler (kein String)");
    }
  }

});

var SrField_IP = SrField_CSV.extend({

  comma: '.',

  transform_value: function(value) { return parseInt(value); },

  error_ip: function() {
    this.error("Hier muss eine g&uuml;ltige IP angegeben werden (z.b. 192.168.1.0)");
  },

  validate: function() {
    if (this.value.length == 4) {
      $.each(this.value,function(i,val){
        if (isNaN(val)) {
          this.error_ip();
        } else if (val < 0 || val > 255) {
          this.error_ip();
        }
      });
    } else if (this.value.length == 0) {
      this.value = undefined;
    } else {
      this.error_ip();
    }
  }

});

var SrField_Weekprograms = SrField_CSV.extend({

  template: 'weekprograms',

  transform_value: function(value) { return parseInt(value); },

  error_data: function() {
    this.error("Die Werte sind ung&uuml;ltig, dies k&ouml;nnte ein Problem mit dem Browser sein.");
  },

  validate: function() {
    var self = this;
    if (self.value.length == 8) {
      $.each(self.value,function(i,val){
        if (isNaN(val)) {
          self.error_data();
        } else if (val < 0 || val > 8) {
          self.error_data();
        }
      });
    } else if (self.value.length == 0) {
      self.value = undefined;
    } else {
      self.error_data();
    }
  },

  initjs: function(){
    var self = this;
    var weekprograms = $('#' + self.id + '_weekprograms');
    var selects = weekprograms.find('select');
    $.each(self.value || [0,0,0,0,0,0,0,0],function(i,program){
      selects.each(function(){
        if ($(this).data('weekday') == i) {
          if (program_names[program]) {
            $(this).val(program);
          }
        }
      });
    });
    selects.change(function(){
      var selected_programs = [undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined];
      selects.each(function(){
        selected_programs[$(this).data('weekday')] = $(this).val();
      });
      self.html_field().val(selected_programs.join(self.comma));
    });
    self.html_field().trigger('change');      
  }

});

var SrField_Weekday = SrField_CSV.extend({

  template: 'weekday',

  transform_value: function(value) { return parseInt(value); },

  initjs: function(){
    var self = this;
    var daypicker = $('#' + self.id + '_daypicker');
    var checkboxes = daypicker.find('input[type=checkbox]');
    $.each(checkboxes,function(i,el){
      var checkbox = $(el);
      if ($.inArray(parseInt(checkbox.val()),self.value) != -1) {
        checkbox.prop('checked',true);
      }
      checkbox.change(function(){
        var days = new Array();
        $.each(checkboxes,function(i,checkbox){
          if ($(checkbox).prop('checked')) {
            days.push($(checkbox).val());
          }
        });
        self.html_field().val(days.join(self.comma));
      });
    });
  }

});

var SrField_Time = SrField_Integer.extend({

  template: 'time',

  validate: function(){
    this._super();
    if (!this.has_errors()) {
      if (this.value < 0 || this.value > 1440) {
        this.error("Unbekannter Fehler (Wert nicht zwischen 0 und 1440)");
      }
    }
  },

  initjs: function(){
    var self = this;
    var html_field = self.html_field();
    var table = html_field.parent().find('.timepickertable');
    table.find('.hrs').on('click',function(){
      var hour = Math.floor(html_field.val() / 60);
      var minute = html_field.val() - ( hour * 60 );
      var new_hour = parseInt($(this).text());
      var new_daymin = ( new_hour * 60 ) + minute;
      html_field.val(new_daymin);
      html_field.parent().find('.timepicked').text(daymin_to_time(new_daymin));
    });
    table.find('.minutes').on('click',function(){
      var hour = Math.floor(html_field.val() / 60);
      var new_minute = parseInt($(this).text());
      var new_daymin = ( hour * 60 ) + new_minute;
      html_field.val(new_daymin);
      html_field.parent().find('.timepicked').text(daymin_to_time(new_daymin));
    });
  }

});

var SrField_Select = SrField.extend({

  template: 'select',
  integer: false,
  options: undefined,

  html_value: function(){
    return this.html_field().val();
  },

  transform: function(){
    if (this.integer) {
      SrField_Integer_Transform.call(this);
    } else {
      this.value = this.html_value();
    }
  },

  initjs: function(){
    var select = this.html_field();
    if (typeof this.value !== 'undefined') {
      select.val(this.value);      
    }
    select.find('option:selected').each(function(){
      select.css('background-color',$(this).css('background-color'));
    });
    select.change(function(){
      select.find('option:selected').each(function(){
        select.css('background-color',$(this).css('background-color'));
      });
    });
  }

});

var SrField_Timezone = SrField_Select.extend({

  template: 'timezone',
  transform: SrField_Integer_Transform

});
