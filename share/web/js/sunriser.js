
var sr_config;

var sr_config_main_keys = [
  'model','model_id','pwm_count','factory_version','language','timezone',
  'updated','name','showexpert'
];

var current_time;
var sr_config_def;
var sr_config_types = {};

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
      sr_storage_update();
      $('body').trigger('sr_config');
    });
  } else {
    $('body').trigger('sr_config');    
  }

});

$('body').on('sr_config',function(){

  $(".form").not(".noautoload").each(function(){
    var id = $(this).attr('id');
    var form = new SrForm(this,sr_forms[id]);
  });

});

// Slider
// This script was stolen here : http://voidcanvas.com/jquery-slider-without-using-jquery-ui-plugin/ 
$(function(){
  var i = 0;
  var j = 0;

  $('.sliders').each(function() {
    control = $(this).attr('data-control-group')
    htm = '<div class="slide-control">'+
        '<div class="slide-control-button" data-control-group="'+control+'"></div>'+
        '</div>';
    $(this).after(htm).attr('readonly', true).css('display', "none");

    // dragging example
    var sliders  = $(this).next();
    var button = sliders.find('.slide-control-button');
    var startOffset, holderOffset, sliderWidth, handleWidth;
        
    button.on('mousedown', function(e) {
       e.preventDefault(); 
        holderOffset = sliders.offset().left;
        startOffset = button.offset().left - holderOffset;
        sliderWidth = sliders.width();
        $(document).on('mousemove', moveHandler);
        $(document).on('mouseup', stopHandler);                
    });
    function moveHandler(e) {
	j=i;
	var posX = e.pageX - holderOffset;
	posX = Math.min(Math.max(0, posX), sliderWidth-4);
	i = button.offset().left - 88;
        $('#restuaPoints').html(Math.round((posX/sliderWidth)*100)+'%');

        button.css({
	  left: posX
	});
    }
    function stopHandler() {
        $(document).off('mousemove', moveHandler);
        $(document).off('mouseup', stopHandler);
    }     
});
});


