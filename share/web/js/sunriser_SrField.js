
var SrField = Class.extend({

  name: undefined,
  id: undefined,
  label: undefined,
  desc: undefined,
  type: undefined,
  template: undefined,
  pre: false,
  validator: undefined,

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
  transform: function(){
    this.value = this.html_value();
  },
  validate: function(){},

  value: undefined,
  errors: undefined,

  init: function(config_param) {
    var config = {}; $.extend(config,config_param);
    this.id = config.name.replace(/#/g,'_');
    this.class = config.type.replace(/\(/g,'_').replace(/\)/g,'_');
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

  reset: function() {
    this.errors = undefined;
  }

});

var SrField_Text = SrField.extend({

  template: 'text',

  transform: function() {
    var value = this.html_value();
    if (typeof value === 'string') {
      this.value = value;
    } else {
      this.error("Unbekannter Fehler (kein String)");
    }
  }

});

var SrField_Integer = SrField_Text.extend({

  transform: function() {
    var value = this.html_value();
    if (isNaN(value)) {
      this.error("Hier muss eine Zahl angegeben werden.");
    } else {
      this.value = parseInt(value);
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
    this.value = this.html_field().prop("checked") ? true : false;
  }

});

var SrField_CSV = SrField_Text.extend({

  comma: ',',

  transform: function() {
    var value = this.html_value();
    if (typeof value === 'string') {
      if (value.length) {
        this.value = value.split(this.comma);
      } else {
        this.value = [];
      }
    } else {
      this.error("Unbekannter Fehler (kein String)");
    }
  }

});

var SrField_IP = SrField_CSV.extend({

  comma: '.',

  error_ip: function() {
    this.error("Hier muss eine g&uuml;ltige IP angegeben werden (z.b. 192.168.1.0)");
  },

  validate: function() {
    var wrong = false;
    if (this.value.length == 4) {
      $.each(this.value,function(i,val){
        if (val < 0 || val > 255) {
          wrong = true;
        }
      });
    }
    if (wrong) {
      this.error_ip();      
    }
  }

});

var SrField_Weekday = SrField_CSV.extend({

  template: 'weekday'

});

var SrField_Select = SrField.extend({

  template: 'select'

});

var SrField_Timezone = SrField_Select.extend({

  template: 'timezone'

});
