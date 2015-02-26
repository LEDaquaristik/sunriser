
var sr_config;

var sr_config_main_keys = [
  'model','model_id','pwm_count','factory_version','language','timezone',
  'updated','name','showexpert','nohelp'
];

var current_time;
var start_time;
var sr_config_def;
var sr_config_types = {};
var sr_color = {};

//timepicker vars
var hours,
min = null;

$(function(){

  /* VIP */ window.loaded = true; /* VIP */

  moment.locale('de');

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

  //
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

  // Js Timepicker : very 'inspired' by http://codepen.io/ElmahdiMahmoud/pen/Injdq
  
  $(document).on('click', '.hrs', function () {
      hours = $(this).html();
      setDate();
      return false;
  });
  
  $(document).on('click', '.minutes', function () {
      min = $(this).html();
      setDate();
      return false;
  });
  
  function setDate() {
  
      if (hours) {
          if (min) {
              $('#timepicker input').val(hours + ':' + min);
          } else {
              $('#timepicker input').val(hours + ':00');
          }
      } else {
          if (min) {
              $('#timepicker input').val('00:' + min);
          } else {
              $('#timepicker input').val();
          }
      }
  }
  $(document).on('click', 'div.timepickerdiv input', function (e) {
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

  if (typeof(sr_config) === "undefined" || typeof(sr_config.pwm_count) == "undefined") {
    sr_request_mpack('POST','/',sr_config_main_keys,function(values){
      $.each(sr_config_main_keys,function(i,key){
        if (typeof values[key] === 'undefined') {
          values[key] = sr_default(key);
        }
      });
      sr_config = values;
      $('body').trigger('sr_config');
    });
  } else {
    $('body').trigger('sr_config');    
  }

});

$('body').on('sr_config',function(){

  //console.log(sr_config);

  if (sr_config.nohelp) {
    $('.helparea').hide();
  }

  $(".form").not(".noautoload").each(function(){
    var id = $(this).attr('id');
    var form = new SrForm(this,sr_forms[id]);
  });

});
