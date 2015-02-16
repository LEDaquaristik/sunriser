
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
    if (typeof value === 'string') {
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
  initjs: function(){
    var self = this;
    var html_field = self.html_field();

    // This script was stolen here : http://voidcanvas.com/jquery-slider-without-using-jquery-ui-plugin/ 
    if (html_field.hasClass('sliders')) {
      var i = 0;
      var j = 0;
      html_field = self.html_field();
      control = html_field.data('control-group');
      htm = '<div class="slide-control"><div class="fillslide"></div><div class="slide-control-button" data-control-group="'+control+'"></div></div>';
      html_field.after(htm).attr('readonly', true).css('display', "none");

      var sliders  = html_field.next();
      var button = sliders.find('.slide-control-button');
      var fill_slid = sliders.find('.fillslide');
      var startOffset, holderOffset, handleWidth;
      var sliderWidth = sliders.width();

      var range = self.max - self.min;
      var value = html_field.val();
      button.css({
        left: ( sliderWidth * ( ( value - self.min ) / ( self.max - self.min ) ) )
      });
      fill_slid.css({
        width: ( sliderWidth * ( ( value - self.min ) / ( self.max - self.min ) ) + 4 )
      });

      button.on('mousedown', function(e) {
        e.preventDefault(); 
        holderOffset = sliders.offset().left;
        startOffset = button.offset().left - holderOffset;
        sliderWidth = sliders.width();
        $(document).on('mousemove', sliderMoveHandler);
        $(document).on('mouseup', sliderStopHandler);
      });
      function sliderSetValue(factor) {
        var val = Math.round(self.min + ( ( self.max - self.min ) * factor ));
        html_field.val(val);
        $('#' + self.id + '_value').html(self.display_value(val));
      }
      function sliderMoveHandler(e) {
        j=i;
        var posX = e.pageX - holderOffset;
        posX = Math.min(Math.max(0, posX), sliderWidth);
        i = button.offset().left - 88;
        sliderSetValue(posX / sliderWidth);
        button.css({
          left: posX
        });
	fill_slid.css({
          width: posX + 4
	});
      }
      function sliderStopHandler() {
        $(document).off('mousemove', sliderMoveHandler);
        $(document).off('mouseup', sliderStopHandler);
      }     
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

var SrField_CSV = SrField_Text.extend({

  comma: ',',
  transform_value: function(value) { return value; },

  joined_value: function() {
    if (typeof this.value === 'undefined') {
      return "";
    }
    return this.value.join(this.comma);
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
    } else {
      this.error_ip();
    }
  }

});

var SrField_Weekday = SrField_CSV.extend({

  template: 'weekday',

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
    var hour = $('#' + self.id + '_hour');
    var minutes = $('#' + self.id + '_minutes');
    var inuse = $('#' + self.id + '_inuse');
    if (typeof self.value !== 'undefined') {
      hour.val(Math.floor(self.value / 60));
      minutes.val(self.value % 60);
      inuse.prop('checked',true);
    }
    $(hour).add(minutes).change(function(){
      inuse.prop('checked',true);
    }).add(inuse).change(function(){
      if (inuse.prop('checked')) {
        self.html_field().val(parseInt(hour.val()) * 60 + parseInt(minutes.val()));
      } else {
        self.html_field().val(undefined);
      }
    });
  }

});

var SrField_Select = SrField.extend({

  template: 'select',
  options: undefined,

  initjs: function(){
    if (typeof this.value !== 'undefined') {
      this.html_field().val(this.value);      
    }
  }

});

var SrField_Timezone = SrField_Select.extend({

  template: 'timezone',
  transform: SrField_Integer_Transform

});
