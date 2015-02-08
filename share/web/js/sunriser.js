
var sr_config;

var sr_config_main_keys = [
  'model','model_id','pwm_count','factory_version','language','timezone',
  'updated','name','showexpert'
];

var sr_config_def;
var sr_config_types = {};

$(function(){

  /* VIP */ window.loaded = true; /* VIP */

  $('body').removeClass('screenblocker');

  // All external links in new window
  $("a[href^='http']").not('.noblank').each(function(){
    if(this.href.indexOf(location.hostname) == -1) {
      $(this).attr('target', '_blank');
    }
  });

  // Switch all no-js classes to js classes
  $('.no-js').addClass('js').removeClass('no-js');
  
  // Remove all js-remove elements
  $('.js-remove').remove();

  $('.js-hide').hide();

  // Init navigation
  $("#menu > li.first-level").each(function(){
    $(this).find('h2.second-level').text($(this).attr('title'));
  // install click for navigation points
  }).click(function(){
    // but only if they have a sub navigation
    if ($(this).find('.second-nav').length) {
      if ($(".toggle").length > 0) {
        $(".toggle").removeClass("toggle");
      }
      $(this).addClass("toggle");
      $(".overlay").addClass("actif");
    }
  });

  $(".form").each(function(){
    $(this).html('<img class="loader" src="/img/ajaxload.gif">');
  });

  // Menu overlay click functionality
  $(".overlay").click(function(){
    $(".toggle").removeClass("toggle");
    $(".overlay").removeClass("actif");
  });

  $(".tip").tipr({ mode: 'top' });

  if (typeof sr_config_def_factory != 'undefined') {
    sr_config_def = sr_config_def_factory;
    $('body').trigger('sr_config_def');
  } else {
    $.getJSON( "/sr_config_def.json", function( data ) {
      sr_config_def = data;
      $('body').trigger('sr_config_def');
    });
  }

});

$('body').on('sr_config_def',function(){

  if (typeof(Storage) !== "undefined") {
    var session_sr_config = sessionStorage.getItem('sr_config');
    if (session_sr_config) {
      sr_config = JSON.parse(session_sr_config);
    }
  }

  if (typeof(sr_config) === "undefined") {
    sr_request_mpack('POST','/',sr_config_main_keys,function(values){
      $.each(sr_config_main_keys,function(i,key){
        if (typeof values[key] === 'undefined') {
          values[key] = sr_default(key);
        }
      });
      sr_config = values;
      if (typeof(Storage) !== "undefined") {
        sessionStorage.setItem('sr_config',JSON.stringify(sr_config));
      }
      $('body').trigger('sr_config');
    });
  } else {
    $('body').trigger('sr_config');    
  }

});

$('body').on('sr_config',function(){

  $(".form").not( ".noautoload" ).each(function(){
    var id = $(this).attr('id');
    sr_make_form(this,sr_forms[id]);
  });

  $("#dayplan").each(function(){

    var fields = [];
    for (i = 1; i <= sr_config['pwm_count']; i++) { 
      fields.push({
        name: "marker#" + i,
        label: "Tagesverlauf LED #" + i,
        type: "marker"
      });
    }

    sr_make_form(this,{
      formtitle: "Tagesplannung",
      prefix: "dayplanner",
      fields: fields
    });

  });

});

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

    // replacements
    name = name.replace('weather#setup#X#','weather#setup#' + $('#weather_setup_id').val() + '#');
    //

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
      $('#blockertext').html('Speichern');
      $('body').addClass('screenblocker');
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

function sr_request_mpack(method,url,data,success) {
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
      // TODO error handling
    },
    beforeSend: function(xhr,settings){
      if (method == 'PUT') {
        $('#blockertext').html('Speichern');
        $('body').addClass('screenblocker');
      }
    },
    complete: function(xhr,status){
      if (method == 'PUT') {
        $('body').removeClass('screenblocker');
      }
    },
    success: function(data,status,xhr){
      if (xhr.getResponseHeader('content-type') == 'application/x-msgpack') {
        var bytearray = new Uint8Array(data);
        data = msgpack.unpack(bytearray);
      };
      if (success) {
        success.call(this,data,status,xhr);
      }
    },
  };
  $.ajax(call_options);
}
