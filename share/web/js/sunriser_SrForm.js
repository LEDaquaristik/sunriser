
var SrForm = Class.extend({

  template: "form_std_tmpl",
  formsubmit: "Speichern",
  prefix: undefined,
  title: undefined,
  no_values: false,

  error: false,

  init: function(target,config_param) {
    var self = this;
    var config = {}; $.extend(config,config_param);
    var fields = config.fields; delete config.fields;
    self.target = target;
    self.fields = new Array();
    $.each(fields,function(i,field){
      if (typeof config.prefix !== 'undefined') {
        field.name = config.prefix + '#' + field.name;
      }
      // Weather setup replacement
      field.name = field.name.replace('weather#setup#X#','weather#setup#' + $('#weather_setup_id').val() + '#');
      self.fields.push(self.get_field(field));
    });
    $.extend(this,config);

    sr_request_mpack('POST','/',self.keys(),function(values){
      $.each(self.fields,function(i,field){
        field.val(values[field.name]);
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
      field.prepare.call(field);
      field.initjs.call(field);
    });
    $(self.target).find('form').submit(function(e){
      e.preventDefault();
      self.reset();
      self.submit();
    });
  },

  submit: function() {
    var self = this;
    var values = {};
    $.each(self.fields,function(i,field){
      field.transform.call(field);
      if (!field.has_errors()) {
        field.validate.call(field);        
      }
      if (field.has_errors()) {
        self.error = true;
      } else {
        values[field.name] = field.value;
      }
    });
    if (!self.error) {
      sr_request_mpack('PUT','/',values,function(){
        // TODO Successfully saved notice
      });
    }
  },

  get_field: function(field) {
    if (typeof field.type === 'undefined') {
      field.type = sr_type(field.name);
    }
    switch(field.type) {
      case 'array(weekday)':
        return new SrField_Weekday(field);
      case 'bool':
        return new SrField_Checkbox(field);
      case 'select':
        return new SrField_Select(field);
      case 'timezone':
        return new SrField_Timezone(field);
      case 'ip4':
        return new SrField_IP(field);
      case 'bool':
        return new SrField_Checkbox(field);
      case 'integer':
        return new SrField_Integer(field);
      default:
        return new SrField_Text(field);
    }
  },

  keys: function() {
    var keys = [];
    $.each(this.fields,function(i,field){
      keys.push(field.name);
    });
    return keys;
  }

});
