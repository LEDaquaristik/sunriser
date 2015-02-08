
function sr_form_error(field,error) {
  var err = $('#' + field + '_error');
  if (error) {
    $('#' + field).trigger('error',error);
    err.append('<div class="error">' + error + '</div>');
  } else {
    err.html('');
  }
}

function sr_make_form(target,args){
  var template = "form_std_tmpl";
  if (typeof args["formsubmit"] === 'undefined') {
    args["formsubmit"] = "Speichern"      
  }
  if (typeof args["prefix"] !== 'undefined') {
    var prefix = args["prefix"];
    for ( var i = 0; i < args["fields"].length; i++ ) {
      var old_name = args["fields"][i]["name"];
      args["fields"][i]["name"] = prefix + '#' + old_name;
    }
  }
  for ( var i = 0; i < args["fields"].length; i++ ) {
    var name = args["fields"][i]["name"];

    // v- replacements -
    name = name.replace('weather#setup#X#','weather#setup#' + $('#weather_setup_id').val() + '#');
    // ^----------------

    args["fields"][i]["name"] = name;

    if (typeof args["fields"][i]["type"] === 'undefined') {
      args["fields"][i]["type"] = sr_type(name);
    }
  }
  var keys = [];
  for ( var i = 0; i < args["fields"].length; i++ ) {
    var key = args["fields"][i]["name"];
    keys.push(key);
  }
  sr_request_mpack('POST','/',keys,function(values){
    $.each(args['fields'],function(i,field){
      if (values[field['name']] !== null) {
        args['fields'][i]['value'] = values[field['name']];
      }
      //
      //     _/_/_/    _/_/_/    _/_/_/_/  _/_/_/      _/_/    _/_/_/    _/_/_/_/
      //    _/    _/  _/    _/  _/        _/    _/  _/    _/  _/    _/  _/
      //   _/_/_/    _/_/_/    _/_/_/    _/_/_/    _/_/_/_/  _/_/_/    _/_/_/
      //  _/        _/    _/  _/        _/        _/    _/  _/    _/  _/
      // _/        _/    _/  _/_/_/_/  _/        _/    _/  _/    _/  _/_/_/_/
      //
      if (typeof field['value'] === 'undefined') {
        var value = sr_default(field['name']);
        if (typeof value !== 'undefined') {
          field['value'] = value;
        }
      }

      if (field['type'] == 'ip4') {
        if (Object.prototype.toString.call(values[field['name']]) === '[object Array]') {
          args['fields'][i]['value'] = values[field['name']].join('.');
        }
      }
    });
    $(target).html(tmpl(template,args));
    //
    //     _/_/_/      _/_/      _/_/_/  _/_/_/_/_/            _/    _/_/_/
    //    _/    _/  _/    _/  _/            _/                _/  _/
    //   _/_/_/    _/    _/    _/_/        _/                _/    _/_/
    //  _/        _/    _/        _/      _/          _/    _/        _/
    // _/          _/_/    _/_/_/        _/            _/_/    _/_/_/
    //
    $.each(args['fields'],function(i,field){
      var f = $('#' + field['name']);

      if (field['type'] == 'timezone' || field['type'] == 'select') {
        f.val(values[field['name']]);
        if (field['type'] == 'timezone') {
          f.off('change').on('change',function(){
            var o = f.find('option:selected');
            $('#nodst').val(o.data('nodst'));
            $('#gmtoff').val(o.data('gmtoff'));
          });
        }
      }
    });
    $(target).find('form').submit(function(e){
      e.preventDefault();
      var values = {};
      var error;
      $.each($(this).serializeArray(),function(i,field){
        values[field.name] = field.value;
      });

      //
      // _/_/_/_/_/  _/_/_/      _/_/    _/      _/    _/_/_/  _/_/_/_/    _/_/    _/_/_/    _/      _/
      //    _/      _/    _/  _/    _/  _/_/    _/  _/        _/        _/    _/  _/    _/  _/_/  _/_/
      //   _/      _/_/_/    _/_/_/_/  _/  _/  _/    _/_/    _/_/_/    _/    _/  _/_/_/    _/  _/  _/
      //  _/      _/    _/  _/    _/  _/    _/_/        _/  _/        _/    _/  _/    _/  _/      _/
      // _/      _/    _/  _/    _/  _/      _/  _/_/_/    _/          _/_/    _/    _/  _/      _/
      //

      $.each(args['fields'],function(i,field){
        if (field['type'] == 'checkbox') {
          if (!(field['name'] in values)) {
            values[field['name']] = $('#' + field['name']).prop("checked") ? true : false;
          }
        }
        sr_form_error(field['name']); // clear error
      });
      $.each(values,function(k,val){

        //
        //   _/      _/    _/_/    _/        _/_/_/  _/_/_/      _/_/    _/_/_/_/_/  _/_/_/_/
        //  _/      _/  _/    _/  _/          _/    _/    _/  _/    _/      _/      _/
        // _/      _/  _/_/_/_/  _/          _/    _/    _/  _/_/_/_/      _/      _/_/_/
        //  _/  _/    _/    _/  _/          _/    _/    _/  _/    _/      _/      _/
        //   _/      _/    _/  _/_/_/_/  _/_/_/  _/_/_/    _/    _/      _/      _/_/_/_/
        //

        if (val === "") {
          values[k] = undefined;
        } else {
          var type = sr_type(k);
          if (type == 'bool') {
            values[k] = val ? true : false;
          } else if (type == 'integer') {
            if (isNaN(val)) {
              error = 1; sr_form_error(k,"Hier muss eine Zahl angegeben werden.");
            } else {
              values[k] = parseInt(val);              
            }
          } else if (type == 'array(daymin,percent)') { // 360,0,720,100,1080,100,1200,0 (6 uhr: 0, 12 uhr: 100, 18 uhr: 100, 20 uhr: 0)
            var marker = val.split(",");
            var packvalues = [];
            $.each(marker,function(i,value){
              packvalues.push(value);
            });
            values[k] = packvalues;
          } else if (type == 'text') {
            values[k] = String(val);
          } else if (type == 'ip4') {
            if (ipaddr.isValid(values[k])) {
              var ipparts = values[k].split(".");
              var ip = [];
              $.each(ipparts,function(i,val){
                var ip_part = parseInt(val);
                if (ip_part < 0 || ip_part > 255) {
                  error = 1; sr_form_error(k,"Du musst eine g&uuml;ltige IPv4 Adresse angeben (z.b. 192.168.0.1).");                  
                }
                ip.push(ip_part);
              });
              values[k] = ip;
            } else {
              error = 1; sr_form_error(k,"Du musst eine g&uuml;ltige IPv4 Adresse angeben (z.b. 192.168.0.1).");
            }
          }
        }
      });
      if (!error) {
        console.log(values);
        sr_request_mpack('PUT','/',values,function(){
          // TODO Successfully saved notice
        });
      } else {
        $('body').removeClass('screenblocker');
        // TODO "there are errors" notice
      }
    });
  });
}
