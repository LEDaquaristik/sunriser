function sr_generate_weather_web() {
  var legacy_keys = [
    "weather#setup#0#pwms",
    "weather#setup#0#rain#activated",
    "weather#setup#0#rain#daychance",
    "weather#setup#0#rain#rainshare",
    "weather#setup#0#rain#raincloudshare",
    "weather#setup#0#rain#dropdarkness",
    "weather#setup#0#clouds#activated",
    "weather#setup#0#clouds#daychance",
    "weather#setup#0#clouds#cloudshare",
    "weather#setup#0#clouds#clouddarkness",
    "weather#setup#0#clouds#mincloud",
    "weather#setup#0#clouds#randcloud",
    "weather#setup#0#thunder#activated",
    "weather#setup#0#thunder#daychance",
    "weather#setup#0#thunder#daymax",
    "weather#setup#0#thunder#minstorm",
    "weather#setup#0#thunder#randstorm",
    "weather#setup#0#thunder#nightonly",
    "weather#setup#0#moon#activated",
    "weather#setup#0#moon#maximum"
  ];
  var weather_setup_one = {};
  sr_request_mpack('POST','/',legacy_keys,function(values){
    $.each(legacy_keys,function(i,key){
      if (key != "weather#setup#0#pwms") {
        if (typeof(values[key]) !== 'undefined') {
          var newkey = key.replace('#0#','#1#');
          weather_setup_one[newkey] = values[key];            
        }
      }
    });
    var pwms = values["weather#setup#0#pwms"];
    if (pwms && pwms.length) {
      $.each(pwms,function(i,pwm){
        weather_setup_one["pwm#" + pwm + "#weather"] = 1;
      });
    }
    weather_setup_one["weather#web"] = JSON.stringify([{
      id: 1,
      name: "Standard Wetterprofil"
    }]);
    console.log(weather_setup_one);
    sr_request_mpack('PUT','/',weather_setup_one,function(){
      window.location.href = window.location.href;
    });
  });
}