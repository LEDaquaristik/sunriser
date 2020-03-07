
var SrForm = Class.extend({

  template: "form_std_tmpl",
  formsubmit: "Speichern",
  formreset: "Standard Werte wiederherstellen",
  prefix: undefined,
  title: undefined,
  loaded: undefined,
  no_values: false,
  no_reset: false,
  no_submit: false,

  error: false,

  init: function(target,config_param) {
    var self = this;
    var config = {}; $.extend(config,config_param);
    var fields = config.fields.slice(); delete config.fields;
    var expert_fields = config.expert_fields ? config.expert_fields.slice() : undefined; delete config.expert_fields;
    if (expert_fields) {
      $.each(expert_fields,function(i,expert_field){
        var field = {}; $.extend(field,expert_field);
        if (!sr_config.showexpert) {
          field.hidden = true;
        }
        fields.push(field);
      });
    }
    //   if (sr_config.showexpert) {
    //     fields.push.apply(fields, expert_fields);
    //   } else {
    //   }
    // }
    self.target = target;
    self.fields = new Array();
    self.fields_by_name = new Object();
    $.each(fields,function(i,srcfield){
      if (typeof srcfield === 'function') {
        srcfield = srcfield.call(self,i);
      }
      var field = {}; $.extend(field,srcfield);
      if (typeof field.name !== 'undefined') {
        if (typeof config.prefix !== 'undefined' && !field.noprefix) {
          field.name = config.prefix + '#' + field.name;
        }
        // Weather setup replacement
        field.name = field.name.replace('weather#setup#X#','weather#setup#' + get_weather_setup_id + '#');
        // -------------------------        
      }
      self.fields_by_name[field.name] = self.get_field(field);
      self.fields.push(self.fields_by_name[field.name]);
    });
    $.extend(this,config);
    sr_request_mpack('POST','/',self.keys(),function(values){
      $.each(self.fields,function(i,field){
        if (typeof field.name !== 'undefined') {
          field.val(values[field.name]);
        }
      });
      self.render();
    });
  },

  reset: function() {
    this.error = false;
    $.each(this.fields,function(i,field){
      field.reset();
    });
  },

  render: function() {
    var self = this;
    $(self.target).html(tmpl(self.template,self));
    $.each(self.fields,function(i,field){
      if (typeof field.data !== 'undefined') {
        $.each(field.data,function(key,val){
          field.html_field().data(key,val);
        });
      }
      field.prepare();
      field.initjs();
      field.initchange();
      field.custom_init();
    });
    $(self.target).find('form').submit(function(e){
      e.preventDefault();
      self.reset();
      self.submit();
    });
    $(self.target).find('#form_formreset').click(function(e){
      var values = {};
      $.each(self.fields,function(i,field){
        if (typeof field.name !== 'undefined' && !field.nosubmit) {
          values[field.name] = sr_default(field.name);
        }
      });
      sr_request_mpack('PUT','/',values,function(){
        sr_screenblock('Seite neu laden');
        window.location.href = window.location.href;
      });
    });
    if (typeof self.loaded === 'function') {
      self.loaded();
    }
    is_changed = 0;
  },

  submit: function() {
    var self = this;
    var values = {};
    $.each(self.fields,function(i,field){
      field.error_field().empty();
      field.transform.call(field);
      if (!field.has_errors()) {
        field.validate.call(field);
      }
      if (field.has_errors()) {
        self.error = true;
      } else {
        if (typeof field.name !== 'undefined' && !field.nosubmit) {
          values[field.name] = field.value;
        }
      }
    });
    if (!self.error) {
      sr_request_mpack('PUT','/',values,function(){
        var reload = false;
        $.each(values,function(key,val){
          if ( key == 'showexpert' || key == 'nohelp' || key == 'summertime' || key == 'nodst' || key == 'gmtoff') {
            if (sr_config[key] != val) {
              reload = true;
            }
          }
          if ( key == 'weather#web' || key == 'programs#web' ) {
            reload = true;
          }
          sr_config[key] = val;
        });
        if (reload) {
          window.location.href = window.location.href;
        }
      });
    }
  },

  get_field: function(field) {
    if (typeof field.type === 'undefined') {
      field.type = sr_type(field.name);
    }
    field.form = this;
    switch(field.type) {
      case 'array(weekday)':
        return new SrField_Weekday(field);
      case 'hidden':
        return new SrField_Hidden(field);
      case 'time':
        return new SrField_Time(field);
      case 'bool':
        return new SrField_Checkbox(field);
      case 'select':
        return new SrField_Select(field);
      case 'timezone':
        return new SrField_Timezone(field);
      case 'ip4':
        return new SrField_IP(field);
      case 'weekprograms':
        return new SrField_Weekprograms(field);
      case 'bool':
        return new SrField_Checkbox(field);
      case 'array(integer)':
        return new SrField_CSV(field);
      case 'array(time,percent)':
        return new SrField_CSV(field);
      case 'integer':
        return new SrField_Integer(field);
      case 'json':
        return new SrField_JSON(field);
      default:
        return new SrField_Text(field);
    }
  },

  keys: function() {
    var keys = [];
    $.each(this.fields,function(i,field){
      if (typeof field.name !== 'undefined') {
        keys.push(field.name);
      }
    });
    return keys;
  },

  values: function() {
    var values = {};
    $.each(this.fields,function(i,field){
      if (typeof field.value !== 'undefined') {
        values[field.name] = field.value;
      }
    });
    return values;
  }

});
