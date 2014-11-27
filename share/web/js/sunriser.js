
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

  // Menu overlay click functionality
  $(".overlay").click(function(){
    $(".toggle").removeClass("toggle");
    $(".overlay").removeClass("actif");
  });

});
