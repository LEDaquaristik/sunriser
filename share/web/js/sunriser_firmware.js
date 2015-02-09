
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
    // progress: function(evt) {
    //   if (evt.lengthComputable) {
    //     var percentComplete = evt.loaded / evt.total;
    //     $('#progress_download').changePercent(Math.floor(percentComplete * 100));
    //   }
    // },
    error: function (xhr, ajaxOptions, thrownError) {
      // TODO error handling
    },
    success: function (bytesarray) {
      install_firmware(bytesarray);
    }
  };
  $.ajax(call_options);
}

function install_firmware(bytesarray) {
  $('#blockertext').html('Sende neue Firmware an SunRiser');
  $('body').addClass('screenblocker');
  var call_options = {
    type: 'PUT',
    url: '/firmware',
    data: bytesarray,
    contentType: 'application/octet-stream',
    dataType: 'arraybuffer',
    processData: false,
    cache: false,
    // progress: function(evt) {
    //   if (evt.lengthComputable) {
    //     var percentComplete = evt.loaded / evt.total;
    //     $('#progress_install').changePercent(Math.floor(percentComplete * 100));
    //   }
    // },
    error: function(xhr,error,errorthrown){
      // TODO error handling
    },
    success: function(data,status,xhr){
      $('#blockertext').html('<div>Warte auf Neustart</div><div>Bitte das Ger&auml;t NICHT abschalten!!!</div><div>(ca. 1 Min)</div>');
      // TODO real check for back up
      setTimeout(function(){
        window.location.href = window.location.href.replace('firmware','upgraded');
      }, 60000);
    },
  };
  $.ajax(call_options);
}
