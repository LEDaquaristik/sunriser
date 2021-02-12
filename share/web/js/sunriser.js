
var sr_config;

var sr_config_main_keys = [
  'model','model_id','pwm_count','factory_version','language','timezone',
  'gmtoff','nodst','updated','name','showexpert','nohelp','nofinder','usentp',
  'weather#web','weather#last_setup_id','programs#web','sensors#web',
  'programs#last_setup_id','ignoreupgrade','webport','save_version',
  'factory_version','service_value','no_error_logging','info_logging'
];

var firmware_info;
var firmware_root = "http://sunriser.ledaquaristik.de/";
var firmware_images_url = firmware_root + "sunriser_firmware_images.json";
var sr_firmwares;

var current_time;
var start_time;
var sr_config_def;
var sr_config_types = {};
var sr_color = {};
var is_changed = false;

var sr_state;
var sr_bootload;

var sr_config_version;

var url = new URI();
var query = url.search(true);
var get_weather_setup_id = query.weather;
var get_sensors_sensor_id = query.sensor;

var mac;

var weather_profiles = [{
  value: 0,
  backgroundcolor: '#ffffff',
  label: "Kein Wetterprogramm",
  name: "Kein Wetterprogramm"
}];

var sensors = {};
var active_sensors = [];

var programs = [{
  value: 0,
  label: "Kein Programm",
  name: "Kein Programm"
}];

var program_names = {};
var program_colors = {};
var weekdays = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Alltag'];
var months = ['Januar','Februar',unescape("M%E4rz"),'April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
var html_sr8_version;

function isChrome() {
  var isChromium = window.chrome,
    winNav = window.navigator,
    vendorName = winNav.vendor,
    isOpera = winNav.userAgent.indexOf("OPR") > -1,
    isIEedge = winNav.userAgent.indexOf("Edge") > -1,
    isIOSChrome = winNav.userAgent.match("CriOS");

  if(isIOSChrome){
    return true;
  } else if(isChromium !== null && isChromium !== undefined && vendorName === "Google Inc." && isOpera == false && isIEedge == false) {
    return true;
  } else { 
    return false;
  }
}

function daymin_to_time(daymin) {
  var hour = Math.floor(daymin / 60);
  var minute = daymin - ( hour * 60 );
  return ( hour > 9 ? "" : "0" ) + hour + ":" + ( minute > 9 ? "" : "0" ) + minute;
}

$(function(){

  /* VIP */ window.loaded = true; /* VIP */

  moment.locale('de');

  html_sr8_version = $('meta[name=sr8-version]').attr('content');

  // Switch all no-js classes to js classes
  $('.no-js').addClass('js').removeClass('no-js');
  
  // Remove all js-remove elements
  $('.js-remove').remove();

  // Hide all js-hide elements
  $('.js-hide').hide();

  WebFont.load({
    custom: {
      families: ['IcoMoon', 'Open Sans', 'DIN1451']
    },
    active: function() {
      sr_screenunblock();      
    },
    fontinactive: function(familyName, fvd) {
      sr_screenblock('<div>Fehler beim Laden der Schriftarten!</div><div>Bitte die Seite (ggf. mehrmals) neu laden oder anderen Browser verwenden!</div><div>Dieses Interface ist f&uuml;r die Benutzung mit <a href="https://www.google.com/chrome">Google Chrome</a> optimiert!</div>');
    },
    timeout: 10000
  });

  $('#browser_check').each(function(){
    if (!isChrome()) {
      $(this).html('<div class="warnarea">Achtung! Dieses Interface ist f&uuml;r die Benutzung mit <a href="https://www.google.com/chrome">Google Chrome</a> optimiert!</div>');
    }
  });

  // All external links in new window
  $("a[href^='http']").not('.noblank').each(function(){
    if(this.href.indexOf(location.hostname) == -1) {
      $(this).attr('target', '_blank');
    }
  });

  // Init navigation
  $("#menu > li.first-level").each(function(){
    $(this).find('h2.second-level').text($(this).attr('title'));
  // install click for navigation points
  }).click(function(){
    // but only if they have a sub navigation
    if ($(this).find('.second-nav').length) {
      if($(this).hasClass("toggle")){
        $(this).removeClass("toggle");
        $(".overlay").removeClass("actif");
      }else{
        if ($(".toggle").length > 0) {
          $(".toggle").removeClass("toggle");
        }
        $(this).addClass("toggle");
        $(".overlay").addClass("actif");
      }
    }
  });

  // Open and close help sidebar
  $(".help").click(function(){
    $(".hilfe-sidebar").addClass("open-sidebar"); 
    return false; 
  });
  $(".hilfe-close").click(function(){
    $(".hilfe-sidebar").removeClass("open-sidebar"); 
    return false; 
  });
  // Close yellow helparea
  $(".helpareaclose").click(function(){
    $(".helparea").addClass("closethehelparea"); 
    return false; 
  });
  // Close red warnarea
  $(".warnareaclose").click(function(){
    $(".warnarea").addClass("closethewarnarea"); 
    return false; 
  });

  //
  $(".form").not('.noload').each(function(){
    $(this).html('<img class="loader" src="/img/ajaxload.gif"><div class="centerarrow">Wenn dieser Fisch nicht verschwindet, bitte die Seite neuladen.</div>');
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

  $(".hiddencontent").each(function(){
    var id = $(this).attr('id');
    $(this).click(function(){
      $('#' + id + 'content').toggle('slow');
    });
    if ('#' + id == window.location.hash) {
      $(this).click();
    }
  });

  if (query.upgraded_review) {
    $('.upgraded').hide();
  }

  $("#index_reboot_sunriser").click(function(){
    sr_screenblock('<div>Warte auf Neustart</div><div>(ca. 1 Minute)</div>');
    $.get( "/reboot", function(data) {
      wait_for_sunriser();
    });
  });

  interact('.sliderbar').origin('self').draggable({
    inertia: true,
    restrict: { restriction: 'self' },
    max: Infinity
  }).on('dragmove', function (event) {  // call this function on every move
    var sliderWidth = interact.getElementRect(event.target.parentNode).width;
    var value = event.pageX / sliderWidth;
    event.target.style.paddingLeft = (value * 100) + '%';
    $(event.target).data('value', value);
    $(event.target).trigger('change');
  }).on('dragend', function (event) {
    $(event.target).trigger('dragend');    
  });

  $(document).on('click','div.timepickerdiv .timepicked',function(e) {
    e.stopPropagation();
    $('table.timepickertable').removeClass("bunny");
    $(this).parent().find('table.timepickertable').addClass("bunny");
  });
  $(document).on('click', function() {
    $('table.timepickertable').removeClass("bunny");
  });

});

$('body').on('sr_config_def',function(){

  $.each(sr_colors,function(i,color){
    sr_color[color.id] = color;
  });

  if (typeof sr_config === "undefined" || typeof sr_config.pwm_count === "undefined") {
    sr_request_mpack('POST','/',sr_config_main_keys,function(values){
      $.each(sr_config_main_keys,function(i,key){
        if (sr_type(key) == 'json') {
          if (typeof values[key] === 'undefined') {
            var def = sr_default(key);
            if (def) {
              values[key] = $.parseJSON(def);
            }
          } else {
            values[key] = $.parseJSON(values[key]);
          }
        } else if (typeof values[key] === 'undefined') {
          values[key] = sr_default(key);
        }
      });
      sr_config = values;
      $('body').trigger('sr_config_legacy');
    });
  } else {
    $('body').trigger('sr_config_legacy');
  }

});

$('body').on('sr_config_legacy',function(){

//  _
// | |    ___  __ _  __ _  ___ _   _
// | |   / _ \/ _` |/ _` |/ __| | | |
// | |__|  __/ (_| | (_| | (__| |_| |
// |_____\___|\__, |\__,_|\___|\__, |
//            |___/            |___/
//

  sr_config_version = sr_config['save_version'] * 1000;

  if (sr_config_version && sr_config_version == (sr_config['factory_version'] * 1000)) {
    $('body').trigger('sr_config_init');
  } else {
    if (!sr_config_version) {
      sr_config_version = 0;
    }

    var is_config_modified = false;
    var modified_config = {};
    var task_count = 1;

    var task_finished = function(new_config){
      if (new_config) {
        $.each(new_config,function(k,v){
          if (!k in sr_config || sr_config[k] != v) {
            is_config_modified = true;
            modified_config[k] = v;
          }
        });
      }
      task_count--;
      if (task_count == 0) {
        sr_config_version == sr_config['factory_version'] * 1000;
        if (is_config_modified) {
          sr_request_send_config(modified_config,function(){
            window.location.href = window.location.href;
          });
        } else {
          $('body').trigger('sr_config_init');
        }
      }
    };

    if (!sr_config['programs#web']) {
      is_config_modified = true;
      modified_config['programs#web'] = [];
    }

    if (!sr_config['weather#web']) {
      task_count++;
      sr_generate_weather_setup_one(function(new_config){
        task_finished.call(this,new_config);
      });
    }

    if (sr_config_version < 850 && sr_config['programs#web'] && sr_config['programs#web'].length) {
      task_count++;
      sr_update_weekplanner_legacy(function(new_config){
        task_finished.call(this,new_config);
      });
    }

    if (sr_config_version < 900) {
      task_count++;
      sr_update_weather_fields(function(new_config){
        task_finished.call(this,new_config);
      });
    }

    task_finished.call(this);    
  }

});

$('body').on('sr_config_init',function(){

  if (sr_config.nohelp) {
    $('.helparea').hide();
  }

  if (sr_config.showexpert) {
    $('.expert-menu').show();
    $('.expert-only').show();
  } else {
    $('.noexpert-hide').hide();
    $('.expert-only').hide();
  }

  var i = 0;
  $.each(sr_config['sensors#web'],function(rom,v){
    if (v) {
      var bg_color = v.backgroundcolor ? v.backgroundcolor : sr_colors[i++ % sr_colors.length].color;
      var sensor = $.extend({}, v);
      if (!sensor['backgroundcolor']) {
        sensor['backgroundcolor'] = sr_colors[i++ % sr_colors.length].color;
      }
      sensors[v.id] = sensor;
    }
  });

  var got_empty = false;

  var first_weather_setup_id;
  $.each(sr_config['weather#web'],function(i,v){
    if (v) {
      if (!first_weather_setup_id) {
        first_weather_setup_id = v.id;
      }
      var label = "#" + v.id + " " + v.name;
      weather_profiles.push({
        value: v.id,
        name: v.name,
        label: label,
        backgroundcolor: sr_colors[i % sr_colors.length].color
      });
      var profil_url = url.clone();
      profil_url.removeSearch('weather').addSearch('weather',v.id);
      $('<div class="daybox" id="weathertab' + v.id + '" style="float:left">' + label + '</div>').appendTo('#weathertabs').click(function(){
        window.location.href = profil_url.toString();
      });
    } else {
      got_empty = true;
    }
  });
  $('<div class="daybox" style="float:left">&nbsp;+&nbsp;</div>').appendTo('#weathertabs').click(function(){
    window.location.href = '/weather.html';
  });

  if (got_empty) {
    var new_weather_config = [];
    $.each(sr_config['weather#web'],function(i,v){
      if (v) {
        new_weather_config.push(v);
      }
    });
    sr_config['weather#web'] = new_weather_config;
  }

  got_empty = false;

  var first_programs_setup_id;
  $.each(sr_config['programs#web'],function(i,v){
    if (v) {
      if (!first_programs_setup_id) {
        first_programs_setup_id = v.id;
      }
      var label = "#" + v.id + " " + v.name;
      programs.push({
        value: v.id,
        name: v.name,
        label: label,
        backgroundcolor: sr_colors[i % sr_colors.length].color
      });
      program_names[v.id] = v.name;
      program_colors[v.id] = sr_colors[i % sr_colors.length].color;
    } else {
      got_empty = true;
    }
  });

  if (got_empty) {
    var new_programs_config = [];
    $.each(sr_config['programs#web'],function(i,v){
      if (v) {
        new_programs_config.push(v);
      }
    });
    sr_config['programs#web'] = new_programs_config;
  }

  if (!get_weather_setup_id) {
    get_weather_setup_id = first_weather_setup_id;
  }

  $('#weathertabs').each(function(){
    if (!get_weather_setup_id) {
      window.location.href = '/weather.html';
    }
  });

  $('.weather-profiled').each(function(){
    var link = new URI($(this).attr('href'));
    link.addSearch("weather",get_weather_setup_id);
    $(this).attr('href',link);
  });

  $('#weathertab' + get_weather_setup_id).css('background-color','#dddddd');

  $(".form").not(".noautoload").each(function(){
    var id = $(this).attr('id');
    var form = new SrForm(this,sr_forms[id]);
  });

  $('body').trigger('sr_config');

  // have to be added if we add again a storage
  // if (typeof current_time === 'undefined') {
  //   sr_request_mpack('POST','/',[],function(values){});
  // }

});

$('body').on('sr_config',function(){

  var ts = Math.round((new Date()).getTime() / 1000);

  var storage_firmware_version = store.get('sr_firmware_version');
  var storage_firmware_info = store.get('sr_firmware_info');
  var storage_firmware_info_time = store.get('sr_firmware_info_time');

  if (storage_firmware_version && storage_firmware_info && storage_firmware_info_time &&
    storage_firmware_info_time > (ts - (60 * 60)) && storage_firmware_version == html_sr8_version) {
    firmware_info = storage_firmware_info;
    $('body').trigger('sr_firmware');
  } else {
    sr_request_mpack('GET','/firmware.mp',undefined,function(values){
      store.set('sr_firmware_version',html_sr8_version);
      store.set('sr_firmware_info',values);
      store.set('sr_firmware_info_time',ts);
      firmware_info = values;
      $('body').trigger('sr_firmware');
    });
  }

});

$('body').on('sr_firmware',function(){

  var ts = Math.round((new Date()).getTime() / 1000);

  var storage_firmwares = store.get('sr_firmwares');
  var storage_firmwares_time = store.get('sr_firmwares_time');

  if (storage_firmwares && storage_firmwares_time && storage_firmwares_time > (ts - (24 * 60 * 60))) {
    sr_firmwares = storage_firmwares;
    $('body').trigger('sr_firmwares');
  } else {
    $.getJSON(firmware_root + "sunriser_firmware_images.json?" + (new Date().getTime()), function(firmwares) {
      store.set('sr_firmwares',firmwares);
      store.set('sr_firmwares_time',ts);
      sr_firmwares = firmwares;
      $('body').trigger('sr_firmwares');
      if (!sr_config.ignoreupgrade) {
        if (!sr_demo && sr_firmwares[0] && sr_firmwares[0].filename != firmware_info.filename) {
          $('div.main').append('<div class="banderolebox"><a href="/firmware.html" class="sunriserbanderole">Neue Firmware ' + unescape("verf%FCgbar%0A") + '!</a></div>');
        }
      }
    });
  }

});