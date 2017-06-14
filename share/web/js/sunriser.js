
var sr_config;

var sr_config_main_keys = [
  'model','model_id','pwm_count','factory_version','language','timezone',
  'gmtoff','nodst','updated','name','showexpert','nohelp','nofinder','usentp',
  'weather#web','weather#last_setup_id','programs#web','programs#last_setup_id',
  'ignoreupgrade','webport','save_version','factory_version','service_value'
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

var sr_config_version;

var url = new URI();
var query = url.search(true);
var get_weather_setup_id = query.weather;

var mac;

var weather_profiles = [{
  value: 0,
  backgroundcolor: '#ffffff',
  label: "Kein Wetterprogramm",
  name: "Kein Wetterprogramm"
}];

var programs = [{
  value: 0,
  label: "Kein Programm",
  name: "Kein Programm"
}];
var program_names = {};
var program_colors = {};
var weekdays = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Alltag'];
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

  WebFont.load({
    custom: {
      families: ['IcoMoon', 'Open Sans', 'DIN1451'],
      urls: ['/fonts.css']
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
  $(".form").each(function(){
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

  $(document).on('click','div.timepickerdiv .timepicked',function (e) {
      $('table.timepickertable').removeClass("bunny");
      e.stopPropagation();
      $(this).parent().find('table.timepickertable').addClass("bunny");
  });
  $(document).on('click', function () {
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
      $('body').trigger('sr_config_init');
    });
  } else {
    $('body').trigger('sr_config_init');
  }

});

$('body').on('sr_config_init',function(){

  sr_config_version = sr_config['save_version'] * 1000;

  if (!sr_config_version) {
    sr_config_version = sr_config['factory_version'] * 1000;
  }

  if (!sr_config['programs#web']) {
    sr_config['programs#web'] = [];
    sr_request_mpack('PUT','/',{
      'programs#web': JSON.stringify([])
    },function(){
      window.location.href = window.location.href;
    });
  } else if (sr_config_version < 850 && sr_config['programs#web'] && sr_config['programs#web'].length) {
    sr_update_weekplanner_legacy();
  } else if (!sr_config['weather#web']) {
    sr_generate_weather_setup_one();
  } else {

    if (sr_config.nohelp) {
      $('.helparea').hide();
    }

    if (sr_config.showexpert) {
      $('.expert-menu').show();
    } else {
      $('.noexpert-hide').hide();
    }

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

    $('#weathertab' + get_weather_setup_id).css('background-color','#dddddd');

    $('.weather-profiled').each(function(){
      var link = new URI($(this).attr('href'));
      link.addSearch("weather",get_weather_setup_id);
      $(this).attr('href',link);
    });

    $(".form").not(".noautoload").each(function(){
      var id = $(this).attr('id');
      var form = new SrForm(this,sr_forms[id]);
    });

    $('body').trigger('sr_config');
  }

  // have to be added if we add again a storage
  // if (typeof current_time === 'undefined') {
  //   sr_request_mpack('POST','/',[],function(values){});
  // }

});


$('body').on('sr_config',function(){

  sr_request_mpack('GET','/firmware.mp',undefined,function(values){
    firmware_info = values;
    $('body').trigger('sr_firmware');
    $.getJSON(firmware_root + "sunriser_firmware_images.json?" + (new Date().getTime()), function(firmwares) {
      sr_firmwares = firmwares;
      $('body').trigger('sr_firmwares');
      if (!sr_config.ignoreupgrade) {
        if (!sr_demo && sr_firmwares[0] && sr_firmwares[0].filename != firmware_info.filename) {
          $('div.main').append('<div class="banderolebox"><a href="/firmware.html" class="sunriserbanderole">Neue Firmware ' + unescape("verf%FCgbar%0A") + '!</a></div>');
        }
      }
    });
  });

});