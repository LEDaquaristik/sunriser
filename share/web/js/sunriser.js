
var sr_forms = {
  network: {
    formtitle: "Netzwerk Einstellungen",
    fields: [{
      name: "hostname", label: "Hostname im Netzwerk"
    },{
      name: "usentp", label: "NTP Server benutzen", type: "checkbox"
    },{
      name: "ntpserver", label: "NTP Server"
    },{
      name: "useip4", label: "Feste IPv4 Adresse benutzen", type: "checkbox"
    },{
      name: "ip4", label: "Feste IPv4 Adresse"
    },{
      name: "ip4_subnet", label: "Feste IPv4 Adresse Subnet"
    },{
      name: "ip4_gateway", label: "Feste IPv4 Adresse Gateway"
    },{
      name: "ip4_dns", label: "Feste IPv4 Adresse DNS"
    },{
      name: "ip4_filter", label: "IPv4 Whitelist Filter aktivieren",
      type: "checkbox"
    },{
      name: "ip4_whitelist", label: "IPv4 Whitelist"
    },{
      name: "webport", label: "Webserver Port"
    }]
  },
  system: {
    formtitle: "System Einstellungen",
    fields: [{
      name: "name", label: "Angezeigter Name des Systems", desc: "Test"
    },{
      name: "indexfile", label: "Startseite nach Anmeldung"
    // },{
    //   name: "timezone", label: "Zeitzone", type: "timezone"
    },{
      name: "nodst", label: "Ignoriere Sommerzeit", type: "checkbox"
    }]
  },
  password: {
    formtitle: "Passwort &auml;ndern",
    no_values: 1,
    fields: [{
      name: "oldpassword", label: "Aktuelles Passwort", type: "password"
    },{
      name: "newpassword", label: "Neues Passwort", type: "password"
    },{
      name: "newpassword2", label: "Neues Passwort wiederholen", type: "password"
    }]
  },
  thunderstorm: {
    formtitle: "Gewitter Simulation",
    prefix: "weather#setup#X#thunder",
    fields: [{
      name: "activated", label: "Simuliere Gewitter", type: "checkbox"
    },{
      name: "daymax", label: "Maximale Anzahl von Gewittern pro Tag"
    },{
      name: "minlength", label: "Minimum L&auml;nge eines Gewitters in Sekunden"
    },{
      name: "maxlength", label: "Maximale L&auml;nge eines Gewitters in Sekunden"
    },{
      name: "balancelength", label: "Anzahl der Faktoren f&uuml;r die Berechnung der Gewitterl&auml;nge"
    },{
      name: "mindist", label: "Minimaler Abstand zwischen den Blitzen"
    },{
      name: "maxdist", label: "Maximaler Abstand zwischen den Blitzen"
    },{
      name: "balancedist", label: "Anzahl der Faktoren f&uuml;r die Berechnung des Abstands zwischen den Blitzen"
    },{
      name: "fadepercent", label: "Prozentualer Anteil f&uuml;r Ein/Ausblendung des Gewitters"
    },{
      name: "daychance", label: "Wahrscheinlichkeit eines Gewitters pro maximale Anzahl von Gewittern am Tag"
    },{
      name: "darkness", label: "Prozentzahl der Dunkelheit die ein Gewitter erzeugt"
    },{
      name: "weekdays", label: "Nur an diesen Wochentagen gibt es Gewitter (sonst jeden Tag)"
    }]
  },
  moon: {
    formtitle: "Mondphasen Simulation",
    prefix: "weather#setup#X#moonphase",
    fields: [{
      name: "activated", label: "Simuliere Mondphasen nach Realit&auml;t", type: "checkbox"
    },{
      name: "starttime", label: "Fr&uuml;hster Mondaufgang"
    },{
      name: "endtime", label: "Sp&auml;tester Monduntergang"
    },{
      name: "maximum", label: "Intensit&auml;t des Monds"
    },{
      name: "deferral", label: "Abstand in Tagen zum echten Mondphasen Zyklus"
    },{
      name: "weekdays", label: "Nur an diesen Wochentagen gibt es Mondphasen (sonst jeden Tag)"
    }]    
  },
  clouds: {
    formtitle: "Wolken Simulation",
    prefix: "weather#setup#X#clouds",
    fields: [{
      name: "activated", label: "Simuliere Wolken", type: "checkbox"
    },{
      name: "cloudminlength", label: "Minimum L&auml;nge einer Wolke in Sekunden"
    },{
      name: "cloudmaxlength", label: "Maximale L&auml;nge einer Wolke in Sekunden"
    },{
      name: "cloudbalancelength", label: "Anzahl der Faktoren f&uuml;r die Berechnung der Wolkenl&auml;nge"
    },{
      name: "cloudchance", label: "Wahrscheinlichkeit einer Wolke pro Minute"
    },{
      name: "clouddarkness", label: "Prozentzahl der Dunkelheit die ein Gewitter erzeugt"
    },{
      name: "weekdays", label: "Nur an diesen Wochentagen gibt es Mondphasen (sonst jeden Tag)"
    }]
  },
  rain: {
    formtitle: "Regen Simulation",
    prefix: "weather#setup#X#rain",
    fields: [{
      name: "activated", label: "Simuliere Regen", type: "checkbox"
    },{
      name: "rainchance", label: "Wahrscheinlichkeit eines Regentages"
    },{
      name: "raindarkness", label: "Maximale Prozentzahl an Dunkelheit die ein Regen haben kann"
    },{
      name: "rainwithclouds", label: "Wolken k&ouml;nnen die Regentage &uuml;ber das maximum dunkler machen", type: "checkbox"
    },{
      name: "weekdays", label: "Nur an diesen Wochentagen gibt es Mondphasen (sonst jeden Tag)"
    }]
  }
};

var sr_config;

var sr_config_main_keys = [
  'model','model_id','pwm_count','factory_version','language','timezone',
  'updated','name'
];

var sr_config_def;
var sr_config_types = {};

$(function(){

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
  var keys = [];
  for ( var i = 0; i < args["fields"].length; i++ ) {
    keys.push(args["fields"][i]["name"]);
  }
  sr_request_mpack('POST','/',keys,function(values){
    $.each(args['fields'],function(i,field){
      if (values[field['name']] !== null) {
        args['fields'][i]['value'] = values[field['name']];
      }
      if (typeof field['value'] === 'undefined') {
        var value = sr_default(field['name']);
        if (typeof value !== 'undefined') {
          field['value'] = value;
        }
      }
    });
    $(target).html(tmpl(template,args));
    $(target).find('form').submit(function(e){
      e.preventDefault();
      var values = {};
      var error;
      $.each($(this).serializeArray(),function(i,field){
        values[field.name] = field.value;
      });
      $.each(args['fields'],function(i,field){
        if (field['type'] == 'checkbox') {
          if (!(field['name'] in values)) {
            values[field['name']] = $('#' + field['name']).prop("checked") ? true : false;
          }
        }
        sr_form_error(field['name']); // clear error
      });
      $.each(values,function(k,val){
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
          } else if (type == 'array(time,percent)') {
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
                ip.push(parseInt(val));
              });
              values[k] = ip;
            } else {
              error = 1; sr_form_error(k,"Du musst eine g&uuml;ltige IPv4 Adresse angeben (z.b. 192.168.0.1).");
            }
          }
        }
      });
      if (!error) {
        sr_request_mpack('PUT','/',values,function(){
          // TODO show success
        });
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
        // TODO activate saving overlay      
      }
    },
    complete: function(xhr,status){
      if (method == 'PUT') {
        // TODO deactivate saving overlay
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
