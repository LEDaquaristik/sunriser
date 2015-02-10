
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
      // TODO remove debugging
      console.log(method + ' ' + url);
      console.log(data);
      console.log('Errored: ' + error);
      // TODO remove debugging
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
      };
      if (method == 'PUT') {
        sr_finished();
      }
      // TODO remove debugging
      console.log(method + ' ' + url);
      console.log(data);
      console.log(result);
      // TODO remove debugging
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
