
function sr_type(){
  var args = Array.prototype.slice.call(arguments);
  var key = args.join('#');
  var found;
  $.each(sr_config_def,function(k,val){
    if (typeof found === 'undefined') {
      var regexp = new RegExp('^' + k.replace('X','\\w+') + '$');
      if (regexp.test(key)) {
        found = val['type'];
      }
    }
  });
  return found;
}

function sr_default(){
  var args = Array.prototype.slice.call(arguments);
  var key = args.join('#');
  var found;
  $.each(sr_config_def,function(k,val){
    if (typeof found === 'undefined') {
      var regexp = new RegExp('^' + k.replace('X','\\w+') + '$');
      if (regexp.test(key)) {
        found = val['default'];
      }
    }
  });
  return found;
}
