
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
    error: function(xhr,error,errorthrown){
      if (method == 'PUT') {
        sr_failed();
      }
    },
    beforeSend: function(xhr,settings){
      if (method == 'PUT') {
        sr_screenblock('Speichern');
      }
    },
    complete: function(xhr,status){
      if (method == 'PUT') {
        sr_screenunblock();
        sr_cleanwait();
      }
    },
    success: function(data,status,xhr){
      if (xhr.getResponseHeader('content-type') == 'application/x-msgpack') {
        var bytearray = new Uint8Array(data);
        data = msgpack.unpack(bytearray);
      };
      if (method == 'PUT') {
        sr_finished();
      }
      if (success) {
        success.call(this,data,status,xhr);
      }
    },
  };
  if (typeof data !== 'undefined') {
    call_options.data = bytesarray;
  }
  $.ajax(call_options);
}
