$(document).ready(function(){

  var mouseClick = function () {
    if ($('.toggle').length > 0) {
      $(".toggle").removeClass("toggle");
    }
    $("#" + this.id).addClass("toggle");
    $(".overlay").addClass("actif");
  }

  $("#leds, #status").click(mouseClick);

  $(".overlay").click(function(){
    $(".toggle").removeClass("toggle");
    $(".overlay").removeClass("actif");
  });
});
