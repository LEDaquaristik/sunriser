
function sr_request_mpack(method,url,data,success) {
  if (method == 'PUT') {
    sr_pleasewait();
  }
  var failed = 0;
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
    error: function(xhr,error,errorthrown) {
      failed = failed + 1;
      console.log('Error on mpack request #' + failed);
      if (failed > 2) {
        if (method == 'PUT') {
          sr_failed();
        }
        if (method == 'POST') {
          sr_error();
        }
      } else {
        $.ajax(call_options);
      }
      // console.log(method + ' ' + url);
      // console.log(data);
      // console.log('Errored: ' + error);
    },
    beforeSend: function(xhr,settings) {
      if (method == 'PUT') {
        sr_screenblock('Speichern');
      }
      if (method == 'DELETE') {
        sr_screenblock(unescape("L%F6schen"));
      }
    },
    complete: function(xhr,status) {
    },
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
      if (method == 'PUT') {
        sr_finished();
      }
      // console.log(xhr);
      // console.log(result);      
      if (success) {
        success.call(this,result,status,xhr);
      }
    },
  };
  if (typeof data !== 'undefined') {
    call_options.data = bytesarray;
  }
  $.ajax(call_options);
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

function _wait_for_sunriser_loop(target) {
  setTimeout(function(){
    $.ajax({
      cache: false,
      type: 'GET',
      url: '/ok',
      timeout: 1000,
      complete: function() {
        _wait_for_sunriser_loop(target);
      },
      success: function(data, textStatus, XMLHttpRequest) {
        if (data == 'OK') {
          window.location.href = target;
        }
      }
    });
  },2000);
}

function _wait_for_sunriser_loop_mac(target) {
  var uri = new URI(target);
  setTimeout(function(){
    $.ajax({
      cache: false,
      dataType: "json",
      type: 'GET',
      url: 'http://sunriser.ledaquaristik.de/finder',
      timeout: 3000,
      complete: function() {
        _wait_for_sunriser_loop_mac(target);
      },
      success: function(data, textStatus, XMLHttpRequest) {
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
    _wait_for_sunriser_loop_mac(target);
  }
  _wait_for_sunriser_loop(target);
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
