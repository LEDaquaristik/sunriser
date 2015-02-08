
var sr_config;

var sr_config_main_keys = [
  'model','model_id','pwm_count','factory_version','language','timezone',
  'updated','name','showexpert'
];

var sr_config_def;
var sr_config_types = {};

$(function(){

  /* VIP */ window.loaded = true; /* VIP */

  sr_screenunblock();

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

