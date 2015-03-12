
function sr_request_mpack(method,url,data,success) {
  if (method == 'PUT') {
    sr_pleasewait();
  }
  var mpack = msgpack.pack(data);
  var bytesarray = new Uint8Array(mpack.length);
  for (var i = 0; i < mpack.length; i++) {
    bytesarray[i] = mpack[i];
  }
  var call_options = {
    type: method,
    url: url,
    contentType: 'application/x-msgpack',
    dataType: 'arraybuffer',
    processData: false,
    cache: false,
    error: function(xhr,error,errorthrown) {
      if (method == 'PUT') {
        sr_failed();
      }
      // console.log(method + ' ' + url);
      // console.log(data);
      // console.log('Errored: ' + error);
    },
    beforeSend: function(xhr,settings) {
      if (method == 'PUT') {
        sr_screenblock('Speichern');
      }
    },
    complete: function(xhr,status) {
      if (method == 'PUT') {
        sr_screenunblock();
        sr_cleanwait();
      }
    },
    success: function(result,status,xhr) {
      if (xhr.getResponseHeader('content-type') == 'application/x-msgpack') {
        var bytearray = new Uint8Array(result);
        result = msgpack.unpack(bytearray);
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
      // console.log(method + ' ' + url);
      // console.log(data);
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
  setTimeout(function(){
    update_time();
  }, 1000);
}

var mac;

function _wait_for_sunriser_loop(target) {
  setTimeout(function(){
    $.ajax({
      cache: false,
      type: 'GET',
      url: '/ok',
      timeout: 1000,
      complete: function() {
        wait_for_sunriser_loop(target);
      },
      success: function(data, textStatus, XMLHttpRequest) {
        if (data == 'OK') {
          window.location.href = target;
        }
      }
    });
  },2500);
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
            if (!new_uri.equals(uri)) {
              window.location.href = new_uri.toString();
            }
          }
        }
      }
    });
  },2500);
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
