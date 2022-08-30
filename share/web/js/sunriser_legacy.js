
function sr_generate_weather_setup_one(success) {
  var legacy_keys = [
    "weather#setup#0#pwms",
    "weather#setup#0#rain#activated",
    "weather#setup#0#rain#daychance",
    "weather#setup#0#rain#rainshare",
    "weather#setup#0#rain#raincloudshare",
    "weather#setup#0#rain#dropdarkness",
    "weather#setup#0#clouds#activated",
    "weather#setup#0#clouds#daychance",
    "weather#setup#0#clouds#cloudshare",
    "weather#setup#0#clouds#clouddarkness",
    "weather#setup#0#clouds#mincloud",
    "weather#setup#0#clouds#randcloud",
    "weather#setup#0#thunder#activated",
    "weather#setup#0#thunder#daychance",
    "weather#setup#0#thunder#daymax",
    "weather#setup#0#thunder#minstorm",
    "weather#setup#0#thunder#randstorm",
    "weather#setup#0#thunder#nightonly",
    "weather#setup#0#moon#activated",
    "weather#setup#0#moon#maximum"
  ];
  var weather_setup_one = {};
  sr_request_mpack('POST','/',legacy_keys,function(values){
    $.each(legacy_keys,function(i,key){
      if (key != "weather#setup#0#pwms") {
        if (typeof(values[key]) !== 'undefined') {
          var newkey = key.replace('#0#','#1#');
          weather_setup_one[newkey] = values[key];            
        }
      }
    });
    var pwms = values["weather#setup#0#pwms"];
    if (pwms && pwms.length) {
      $.each(pwms,function(i,pwm){
        weather_setup_one["pwm#" + pwm + "#weather"] = 1;
      });
    }
    var weather_setup_one_name = "Standard Wetterprofil";
    weather_setup_one["weather#web"] = [{
      id: 1,
      name: weather_setup_one_name
    }];
    weather_setup_one["weather#setup#1#name"] = weather_setup_one_name;
    weather_setup_one["weather#last_setup_id"] = 1;
    success.call(this,weather_setup_one);
  });
}

function sr_update_weekplanner_legacy(success) {
  var keys = new Array();
  for (i = 1; i <= sr_config["pwm_count"]; i++) { 
    keys.push('pwm#' + i + '#manager');
  }
  sr_request_mpack('POST','/',keys,function(values){
    var weekplanner_pwms = new Array();
    for (i = 1; i <= sr_config["pwm_count"]; i++) { 
      var key = 'pwm#' + i + '#manager';
      if (values[key] == 2) {
        weekplanner_pwms.push(i);
      }
    }
    if (weekplanner_pwms.length) {
      sr_request_mpack('POST','/',keys,function(values){
        var keys = new Array();
        $.each(values,function(i,v){
          if (i.includes('manager') && i.includes('pwm')) {
            keys.push("weekplanner#programs#" + v);
          }
        });
        sr_request_mpack('POST','/',keys,function(values){
          var new_values = {};
          $.each(values,function(i,v){
            if (i.includes('weekplanner')) {
              if (v) {
                new_values[i] = [
                  v[7],
                  v[1],
                  v[2],
                  v[3],
                  v[4],
                  v[5],
                  v[6],
                  v[0]
                ];
              }
            }
          });
          success.call(this, new_values);
        });
      });
    } else {
      success.call(this);
    }
  });
}

function sr_update_weather_fields(success){
  var weather_types = ['thunder','moon','clouds','rain'];
  var weather_keys = new Array();
  $.each(weather_types,function(i,weather_type){
    var all_fields = sr_forms[weather_type].fields.slice();
    if (sr_forms[weather_type].expert_fields) {
      all_fields.push.apply(all_fields,sr_forms[weather_type].expert_fields.slice());
    }
    $.each(all_fields,function(i,v){
      weather_keys.push(weather_type + '#' + v.name);
    });
  });
  var all_weather_keys = new Array();
  if (sr_config["weather#web"]) {
    $.each(sr_config["weather#web"],function(i,v){
      $.each(weather_keys,function(j,k){
        all_weather_keys.push('weather#setup#' + v.id + '#' + k);
      });
    });
    sr_request_mpack('POST','/',all_weather_keys,function(values){
      var has_new_value = false;
      var new_values = {};
      $.each(sr_config["weather#web"],function(i,v){
        $.each(weather_types,function(j,weather_type){
          if (values['weather#setup#' + v.id + '#' + weather_type + '#activated']) {
            var all_fields = sr_forms[weather_type].fields.slice();
            if (sr_forms[weather_type].expert_fields) {
              all_fields.push.apply(all_fields,sr_forms[weather_type].expert_fields.slice());
            }
            $.each(all_fields,function(h,v){
              var weather_key = weather_type + '#' + v.name;
              if (!weather_key in values || typeof values[weather_key] === 'undefined' || values[weather_key] === null) {
                has_new_value = true;
                new_values[weather_key] = sr_default(weather_key);
              }
            });
          }
        });
      });
      success.call(this,new_values);
    });
  } else {
    success.call(this);
  }
}

function sr_update_sensors_abs(success){
  var new_values = {};
  $.each(sr_config["sensors#web"],function(key,v){
    for (i = 1; i <= sr_config["pwm_count"]; i++) { 
      new_values["sensors#sensor#" + key + "#pwm#" + i + "#absmin"] = true;
      new_values["sensors#sensor#" + key + "#pwm#" + i + "#absmax"] = true;
    }
  });
  success.call(this,new_values);
}
