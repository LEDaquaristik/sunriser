
function sr_request_state(success){
  sr_request_mpack('GET','/state',undefined,function(values){
    sr_state = values;
    $.each(sensors,function(rom,sensor){
      if (typeof sensor['value'] !== 'undefined') {
        delete sensor['value'];
      }
    });
    active_sensors = [];
    if (sr_state.sensors && Object.keys(sr_state.sensors).length > 0) {
      var roms = Object.keys(sr_state.sensors);
      var sr_sensors_web = sr_config['sensors#web'];
      var update = 0;
      var updated_values = {};
      $.each(roms,function(i,rom){
        var desc = sr_state.sensors[rom];
        var device = desc[0];
        var value = desc[1];
        if (!sr_sensors_web[rom]) {
          var new_sensor = {};
          var id = Object.keys(sr_sensors_web).length + 1;
          var new_sensors_web = {
            id: rom,
            sorting: id,
            device: device
          };
          if (sr_sensors[device]) {
            var name = '#' + id + ' ' + sr_sensors[device]['name'];
            updated_values['sensors#sensor#' + rom + '#unit'] = sr_sensors[device]['unit'];
            updated_values['sensors#sensor#' + rom + '#unitcomma'] = sr_sensors[device]['unitcomma'];
            updated_values['sensors#sensor#' + rom + '#min'] = sr_sensors[device]['min'];
            updated_values['sensors#sensor#' + rom + '#max'] = sr_sensors[device]['max'];
            updated_values['sensors#sensor#' + rom + '#name'] = name;
            updated_values['sensors#sensor#' + rom + '#device'] = device;
            updated_values['sensors#sensor#' + rom + '#deviceoffset'] = sr_sensors[device]['offset'];
            updated_values['sensors#sensor#' + rom + '#desiredmin'] = sr_sensors[device]['min'];
            updated_values['sensors#sensor#' + rom + '#desiredmax'] = sr_sensors[device]['max'];
            new_sensors_web['unit'] = sr_sensors[device]['unit'];
            new_sensors_web['unitcomma'] = sr_sensors[device]['unitcomma'];
            new_sensors_web['min'] = sr_sensors[device]['min'];
            new_sensors_web['max'] = sr_sensors[device]['max'];
            new_sensors_web['deviceoffset'] = sr_sensors[device]['offset'];
            new_sensors_web['name'] = name;
          } else {
            var name = '#' + id;
            updated_values['sensors#sensor#' + rom + '#device'] = device;
            updated_values['sensors#sensor#' + rom + '#name'] = name;
            new_sensors_web['unknown'] = 1;
            new_sensors_web['name'] = name;
          }
          sr_sensors_web[rom] = new_sensors_web;
          update = 1;
        } else {
          sensors[rom]['value'] = value;
          active_sensors.push(rom);
        }
      });
      if (update) {
        updated_values['sensors#web'] = sr_sensors_web;
        sr_request_send_config(updated_values,function(){
          window.location.href = window.location.href;
        });
      }
    }
    if (success) {
      success.call(this,values);
    }
  });
}

function sr_request_bootload(success){
  sr_request_mpack('GET','/bootload.mp',undefined,function(values){
    sr_bootload = values;
    if (success) {
      success.call(this,values);
    }
  });
}

function sr_request_send_config(sr_values, success) {
  var values = {};
  $.each(sr_values,function(k,v){
    var type = sr_type(k);
    if (type) {
      var value;
      if (typeof v === 'undefined') {
        value = sr_default(k);
      } else {
        if (type == 'json') {
          value = JSON.stringify(v);
        } else if (type == 'integer') {
          value = parseInt(v);
        } else {
          value = v;
        }
      }
      if (type.startsWith('array')) {
        if (Array.isArray(value)) {
          values[k] = value;
        } else {
          values[k] = [];
        }
      } else if (type == 'bool') {
        values[k] = value ? true : false;
      } else {
        values[k] = value;
      }
    }
  });
  sr_request_mpack('PUT','/',values,function(){
    success.call(this,values);
  });
}

function sr_request_mpack(method,url,data,success) {
  if (method == 'PUT') {
    sr_pleasewait();
  }
  if (method == 'PUT' && url == '/' && sr_config && sr_config.factory_version) {
    data['save_version'] = sr_config.factory_version;
  }
  var mpack = msgpack.encode(data);
  var bytesarray = new Uint8Array(mpack.length);
  for (var i = 0; i < mpack.length; i++) {
    bytesarray[i] = mpack[i];
  }
  var call_options = {};
  call_options = {
    type: method,
    url: url,
    contentType: 'application/x-msgpack',
    dataType: 'arraybuffer',
    processData: false,
    cache: false,
    timeout: 10000,
    beforeSend: function(xhr,settings) {
      if (method == 'PUT' && url == '/') {
        sr_screenblock('Speichern');
      }
      if (method == 'DELETE') {
        sr_screenblock(unescape("L%F6schen"));
      }
    },
    complete: function(xhr,status) {},
    success: function(result,status,xhr) {
      if (method == 'PUT' || method == 'DELETE') {
        sr_screenunblock();
        sr_cleanwait();
      }
      if (xhr.getResponseHeader('content-type') == 'application/x-msgpack') {
        var bytearray = new Uint8Array(result);
        result = msgpack.decode(bytearray);
        if (typeof result.time !== 'undefined' && typeof current_time === 'undefined') {
          current_time = result.time;
          update_time();
        } else if (typeof result.time !== 'undefined') {
          current_time = result.time;
        }
        if (typeof result.uptime !== 'undefined' && typeof current_time !== 'undefined') {
          start_time = current_time - result.uptime;
        }
      };
      if (method == 'PUT' && url == '/') {
        sr_finished();
      }
      if (success) {
        success.call(this,result,status,xhr);
      }
    },
  };
  if (typeof data !== 'undefined') {
    call_options.data = bytesarray;
  }
  $.ajax(call_options).retry({ times: 4 }).fail(function(){
    if (method == 'PUT') {
      sr_failed();
    }
    if (method == 'POST') {
      sr_error();
    }
  });
}

function update_time() {
  var m = moment(current_time * 1000);
  m.utcOffset(0);
  var s = moment(start_time * 1000);
  s.utcOffset(0);
  $('.sunriser_datetime').each(function(){
    var dt_field = $(this);
    dt_field.text(m.format('LLL.ss'));
  });
  var d = moment.duration(s.diff(m));
  $('.sunriser_uptime').text(d.humanize());
  current_time += 1;
  if (typeof service_mode_time !== 'undefined') {
    var st = moment(service_mode_time * 1000);
    st.utcOffset(0);
    var std = moment.duration(st.diff(m));
    $('#service_mode_diff').text('(laufen seit ' + std.humanize() + ')');
  }
  setTimeout(function(){
    update_time();
  }, 1000);
}

function _wait_for_sunriser_loop(target,success_count) {
  setTimeout(function(){
    $.ajax({
      cache: false,
      type: 'GET',
      url: '/ok',
      timeout: 1000,
      error: function() {
        _wait_for_sunriser_loop(target,success_count);
      },
      success: function(data, textStatus, XMLHttpRequest) {
        if (success_count < 3) {
          _wait_for_sunriser_loop(target,success_count + 1);
        } else {
          if (data == 'OK') {
            window.location.href = target;
          }
        }
      }
    });
  }, 2500);
}

function _wait_for_sunriser_loop_mac(target,success_count) {
  var uri = new URI(target);
  setTimeout(function(){
    $.ajax({
      cache: false,
      dataType: "json",
      type: 'GET',
      url: 'http://sunriser.ledaquaristik.de/finder',
      timeout: 1000,
      error: function() {
        _wait_for_sunriser_loop_mac(target,success_count);
      },
      success: function(data, textStatus, XMLHttpRequest) {
        if (success_count < 3) {
          _wait_for_sunriser_loop_mac(target,success_count + 1);
        } else {
          if (data && data[mac]) {
            var ip = data[mac].ip;
            if (ip) {
              var new_uri = uri.clone();
              new_uri.host(ip);
              if (sr_config.webport != 80) {
                new_uri.port(webport);
              }
              if (!new_uri.equals(uri)) {
                window.location.href = new_uri.toString();
              }
            }
          } else {
            _wait_for_sunriser_loop_mac(target,success_count);
          }
        }
      }
    });
  }, 2500);
}

function wait_for_sunriser(target) {
  if (typeof target === 'undefined') {
    target = window.location.href;
  }
  if (mac && !sr_config.nofinder) {
    _wait_for_sunriser_loop_mac(target,0);
  }
  _wait_for_sunriser_loop(target,0);
}

function set_all_pwm(value, success) {
  var data = { pwms: {} };
  for (i = 1; i <= sr_config['pwm_count']; i++) {
    data.pwms[i] = value;
  }
  sr_request_mpack('PUT','/state',data,function(values){
    if (typeof success !== 'undefined') {
      success.call(this, values);
    }
  });
}
