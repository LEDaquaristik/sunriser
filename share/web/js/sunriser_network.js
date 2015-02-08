
function sr_request_mpack(method,url,data,success) {
  if (method == 'PUT') {
    $('.pleasewaitanim').addClass('pleasewait');    
  }
  var mpack = msgpack.pack(data);
  var bytesarray = new Uint8Array(mpack.length);
  for (var i = 0; i < mpack.length; i++) {
    bytesarray[i] = mpack[i];
  }
  var call_options = {
    type: method,
    url: url,
    data: bytesarray,
    contentType: 'application/x-msgpack',
    dataType: 'arraybuffer',
    processData: false,
    cache: false,
    error: function(xhr,error,errorthrown){
      if (method == 'PUT') {
        $('.pleasewaitanim').addClass('failed');
      }
    },
    beforeSend: function(xhr,settings){
      if (method == 'PUT') {
        $('#blockertext').html('Speichern');
        $('body').addClass('screenblocker');
      }
    },
    complete: function(xhr,status){
      if (method == 'PUT') {
        $('.pleasewaitanim').removeClass('pleasewait');
        $('body').removeClass('screenblocker');
      }
    },
    success: function(data,status,xhr){
      if (xhr.getResponseHeader('content-type') == 'application/x-msgpack') {
        var bytearray = new Uint8Array(data);
        data = msgpack.unpack(bytearray);
      };
      if (method == 'PUT') {
        $('.pleasewaitanim').addClass('finished');
      }
      if (success) {
        success.call(this,data,status,xhr);
      }
    },
  };
  $.ajax(call_options);
}
