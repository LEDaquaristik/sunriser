
function load_mac() {

  sr_request_mpack('GET','/bootload.mp',undefined,function(values){
    mac = values.mac.map(function(m){
      var h = m.toString(16); return h.length == 1 ? '0' + h : h;
    }).join(":");
  });

}

function download_and_install_firmware(firmware_url) {
  $('#blockertext').html('Lade neue Firmware aus dem Internet');
  $('body').addClass('screenblocker');
  var call_options = {
    type: 'GET',
    url: firmware_url,
    contentType: 'application/octet-stream',
    dataType: 'arraybuffer',
    processData: false,
    cache: false,
    error: function (xhr, ajaxOptions, thrownError) {
      sr_error();
    },
    success: function (bytesarray) {
      install_firmware(bytesarray);
    }
  };
  $.ajax(call_options);
}

function install_firmware(bytesarray) {
  sr_screenblock('Sende neue Firmware an SunRiser');
  var call_options = {
    type: 'PUT',
    url: '/firmware',
    data: bytesarray,
    contentType: 'application/octet-stream',
    dataType: 'arraybuffer',
    processData: false,
    cache: false,
    error: function(xhr,error,errorthrown){
      sr_error();
    },
    success: function(data,status,xhr){
      sr_screenblock('<div>Warte auf Neustart</div><div>Bitte das Ger&auml;t NICHT abschalten!!!</div><div>(ca. 1 Minute)</div>');
      var target = window.location.href.replace('firmware','upgraded');
      target = target.replace('expert','upgraded');
      wait_for_sunriser(target);
    },
  };
  $.ajax(call_options);
}
