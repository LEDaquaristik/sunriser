
var sr_update_timezone = function(){
  var tz = $('#timezone').val();
  var tzo = $('#timezone option:selected');
  var gmtoff = tzo.data('gmtoff');
  var nodst = tzo.data('nodst');
  $('#gmtoff').val(gmtoff);
  $('#nodst').val(nodst ? 1 : '');
  if (nodst) {
    $('#summertime').parents('tr').hide();
  } else {
    $('#summertime').parents('tr').show();
  }
}

var sr_forms = {
  //
  //     _/      _/  _/_/_/_/  _/_/_/_/_/  _/          _/    _/_/    _/_/_/    _/    _/
  //    _/_/    _/  _/            _/      _/          _/  _/    _/  _/    _/  _/  _/
  //   _/  _/  _/  _/_/_/        _/      _/    _/    _/  _/    _/  _/_/_/    _/_/
  //  _/    _/_/  _/            _/        _/  _/  _/    _/    _/  _/    _/  _/  _/
  // _/      _/  _/_/_/_/      _/          _/  _/        _/_/    _/    _/  _/    _/
  //
  network: {
    title: "Netzwerk Einstellungen",
    fields: [{
      name: "hostname", label: "Hostname im Netzwerk"
    },{
      name: "ntpserver", label: "Internet-Zeitserver (NTP)"
    }],
    expert_fields: [{
      name: "useip4", label: "Feste IPv4 Adresse benutzen"
    },{
      name: "ip4", label: "Feste IPv4 Adresse"
    },{
      name: "ip4_netmask", label: "Feste IPv4 Adresse Netmask"
    },{
      name: "ip4_gateway", label: "Feste IPv4 Adresse Gateway"
    },{
      name: "ip4_dns", label: "Feste IPv4 Adresse DNS"
    // },{
    //   name: "ip4_filter", label: "IPv4 Whitelist Filter aktivieren"
    // },{
    //   name: "ip4_whitelist", label: "IPv4 Whitelist"
    },{
      name: "webport", label: "Webserver Port"
    }]
  },
  //
  //       _/_/_/  _/      _/    _/_/_/  _/_/_/_/_/  _/_/_/_/  _/      _/
  //    _/          _/  _/    _/            _/      _/        _/_/  _/_/
  //     _/_/        _/        _/_/        _/      _/_/_/    _/  _/  _/
  //        _/      _/            _/      _/      _/        _/      _/
  // _/_/_/        _/      _/_/_/        _/      _/_/_/_/  _/      _/
  //
  system: {
    title: "System Einstellungen",
    fields: [{
      name: "timezone", label: "Zeitzone", type: "timezone", integer: true
    },{
      name: "summertime", label: "Sommerzeit"
    },{
      name: "nohelp", label: "Keine Hilfe anzeigen"
    },{
      name: "showexpert", label: "Experten Funktionen aktivieren"
    },{
      name: "nodst", pre: true
    },{
      name: "gmtoff", pre: true
    }],
    expert_fields: [{
      name: "ignoreupgrade", label: "Ignoriere Verf&uuml;gbarkeit neuer Firmware"
    },{
      name: "usentp", label: "Internet-Zeitserver benutzen (NTP)"
    },{
      name: "nofinder", label: "SunRiser Finder deaktivieren"
    },{
      name: "no_error_logging", label: "SunRiser Fehler Logbuch-Datei deaktivieren"
    },{
      name: "info_logging", label: "SunRiser Betriebs Logbuch-Datei aktivieren"
    }],
    loaded: function(){
      sr_update_timezone();
      $('#timezone').change(function(){
        sr_update_timezone();
      });
    }
  },
  //
  //     _/_/_/      _/_/      _/_/_/    _/_/_/  _/          _/    _/_/    _/_/_/    _/_/_/
  //    _/    _/  _/    _/  _/        _/        _/          _/  _/    _/  _/    _/  _/    _/
  //   _/_/_/    _/_/_/_/    _/_/      _/_/    _/    _/    _/  _/    _/  _/_/_/    _/    _/
  //  _/        _/    _/        _/        _/    _/  _/  _/    _/    _/  _/    _/  _/    _/
  // _/        _/    _/  _/_/_/    _/_/_/        _/  _/        _/_/    _/    _/  _/_/_/
  //
  password: {
    title: "Passwort &auml;ndern",
    no_values: 1,
    fields: [{
      name: "oldpassword", label: "Aktuelles Passwort", type: "password"
    },{
      name: "newpassword", label: "Neues Passwort", type: "password"
    },{
      name: "newpassword2", label: "Neues Passwort wiederholen", type: "password"
    }]
  },
  //
  // _/_/_/_/_/  _/    _/  _/    _/  _/      _/  _/_/_/    _/_/_/_/  _/_/_/
  //    _/      _/    _/  _/    _/  _/_/    _/  _/    _/  _/        _/    _/
  //   _/      _/_/_/_/  _/    _/  _/  _/  _/  _/    _/  _/_/_/    _/_/_/
  //  _/      _/    _/  _/    _/  _/    _/_/  _/    _/  _/        _/    _/
  // _/      _/    _/    _/_/    _/      _/  _/_/_/    _/_/_/_/  _/    _/
  //
  thunderstorm: {
    title: "Gewitter Simulation",
    prefix: "weather#setup#X#thunder",
    fields: [{
      name: "activated", label: "Simuliere Gewitter in diesem Profil"
    },{
      name: "daychance", label: "Wahrscheinlichkeit eines Gewitters pro maximale Anzahl von Gewittern am Tag",
      template: "slider", min: 1, max: 100
    },{
      name: "daymax", label: "Maximale Anzahl von Gewittern pro Tag",
      template: "slider", min: 1, max: 24
    },{
      name: "minstorm", label: "Minimum L&auml;nge eines Gewittersturms in Minuten",
      template: "slider", min: 2, max: 10
    },{
      name: "randstorm", label: "Maximale zus&auml;tzliche L&auml;nge eines Gewitters in Minuten",
      template: "slider", min: 10, max: 120
    },{
      name: "zeroonly", label: "Gewitter nur wenn LED Tagesplanung auf 0%"
    },{
      name: "nozeroonly", label: "Gewitter nur wenn LED Tagesplanung nicht 0%"
    // },{
    //   name: "mindist", label: "Minimaler Abstand zwischen den Blitzen in Sekunden",
    //   template: "slider", min: 1, max: 60
    // },{
    //   name: "maxdist", label: "Maximaler Abstand zwischen den Blitzen",
    //   template: "slider", min: 10, max: 300
    // },{
    //   name: "fadepercent", label: "Prozentualer Anteil f&uuml;r Ein/Ausblendung des Gewitters"
    },{
      name: "weekdays", label: "Nur an diesen Wochentagen gibt es Gewitter (sonst jeden Tag)"
    }],
    expert_fields: [{
      name: "min_secs_before_stormfront", label: "min_secs_before_stormfront", template: "slider", min: 0, max: 10000
    },{
      name: "max_secs_before_stormfront", label: "max_secs_before_stormfront", template: "slider", min: 0, max: 10000
    },{
      name: "min_rainfront_length_extra_minutes", label: "min_rainfront_length_extra_minutes", template: "slider", min: 0, max: 10000
    },{
      name: "max_rainfront_length_extra_minutes", label: "max_rainfront_length_extra_minutes", template: "slider", min: 0, max: 10000
    },{
      name: "preflash_duration_ms", label: "preflash_duration_ms", template: "slider", min: 0, max: 10000
    },{
      name: "pause_duration_ms", label: "pause_duration_ms", template: "slider", min: 0, max: 10000
    },{
      name: "full_flash_duration_ms", label: "full_flash_duration_ms", template: "slider", min: 0, max: 10000
    },{
      name: "deload_flash_duration_ms", label: "deload_flash_duration_ms", template: "slider", min: 0, max: 10000
    },{
      name: "deload_pause_duration_ms", label: "deload_pause_duration_ms", template: "slider", min: 0, max: 10000
    },{
      name: "min_secs_between_lightnings", label: "min_secs_between_lightnings", template: "slider", min: 0, max: 10000
    },{
      name: "max_secs_between_lightnings", label: "max_secs_between_lightnings", template: "slider", min: 0, max: 10000
    }]
  },
  //
  //     _/      _/    _/_/      _/_/    _/      _/
  //    _/_/  _/_/  _/    _/  _/    _/  _/_/    _/
  //   _/  _/  _/  _/    _/  _/    _/  _/  _/  _/
  //  _/      _/  _/    _/  _/    _/  _/    _/_/
  // _/      _/    _/_/      _/_/    _/      _/
  //
  moon: {
    title: "Mondphasen Simulation",
    prefix: "weather#setup#X#moon",
    fields: [{
      name: "activated", label: "Simuliere Mondphasen nach Realit&auml;t"
    // },{
    //   name: "starttime", label: "Fr&uuml;hster Mondaufgang"
    // },{
    //   name: "endtime", label: "Sp&auml;tester Monduntergang"
    },{
      name: "maximum", label: "Maximale Intensit&auml;t des Mondes",
      template: "slider", min: 0, max: 200, percent_sign: true
    // },{
    //   name: "deferral", label: "Abstand in Tagen zum echten Mondphasen Zyklus",
    //   template: "slider", min: -31, max: 31
    // },{
    //   name: "weekdays", label: "Nur an diesen Wochentagen gibt es Mondphasen (sonst jeden Tag)"
    }]    
  },
  //
  //      _/_/_/  _/          _/_/    _/    _/  _/_/_/      _/_/_/
  //   _/        _/        _/    _/  _/    _/  _/    _/  _/
  //  _/        _/        _/    _/  _/    _/  _/    _/    _/_/
  // _/        _/        _/    _/  _/    _/  _/    _/        _/
  //  _/_/_/  _/_/_/_/    _/_/      _/_/    _/_/_/    _/_/_/
  //
  clouds: {
    title: "Wolken Simulation",
    prefix: "weather#setup#X#clouds",
    fields: [{
      name: "activated", label: "Simuliere Wolken in diesem Profil"
    },{
      name: "daychance", label: "Wahrscheinlichkeit eines Wolkentages",
      template: "slider", min: 0, max: 100, percent_sign: true
    },{
      name: "mincloudshare", label: "Minimaler Anteil von Wolken am Wolkentag",
      template: "slider", min: 0, max: 100, percent_sign: true
    },{
      name: "cloudshare", label: "Maximaler Anteil von Wolken am Wolkentag",
      template: "slider", min: 0, max: 100, percent_sign: true
    },{
      name: "clouddarkness", label: "Maximale Dunkelheit durch die Wolken",
      template: "slider", min: 1, max: 10
    },{
      name: "weekdays", label: "Nur an diesen Wochentagen gibt es Wolken (sonst jeden Tag)"
    }],
    expert_fields: [{
      name: "mincloud", label: "Minimale L&auml;nge einer Wolke in Sekunden",
      template: "slider", min: 1, max: 120
    },{
      name: "randcloud", label: "Maximale zus&auml;tzliche L&auml;nge einer Wolke in Sekunden",
      template: "slider", min: 0, max: 240
    }]
  },
  //
  //     _/_/_/      _/_/    _/_/_/  _/      _/
  //    _/    _/  _/    _/    _/    _/_/    _/
  //   _/_/_/    _/_/_/_/    _/    _/  _/  _/
  //  _/    _/  _/    _/    _/    _/    _/_/
  // _/    _/  _/    _/  _/_/_/  _/      _/
  //
  rain: {
    title: "Regen Simulation",
    prefix: "weather#setup#X#rain",
    fields: [{
      name: "activated", label: "Simuliere Regen in diesem Profil"
    },{
      name: "daychance", label: "Wahrscheinlichkeit eines Regentages",
      template: "slider", min: 0, max: 100, percent_sign: true
    },{
      name: "minrainshare", label: "Minimaler Anteil von Regenfronten am Regentag",
      template: "slider", min: 0, max: 100, percent_sign: true
    },{
      name: "rainshare", label: "Maximaler Anteil von Regenfronten am Regentag",
      template: "slider", min: 0, max: 100, percent_sign: true
    // },{
    //   name: "raincloudshare", label: "Maximaler Anteil von Wolkenfronten am Regentag (wenn Wolken aktiviert sind)",
    //   template: "slider", min: 0, max: 100, percent_sign: true
    },{
      name: "weekdays", label: "Nur an diesen Wochentagen gibt es Regen (sonst jeden Tag)"
    }],
    expert_fields: [{
      name: "minrain", label: "Minimale Dauer einer Regenfront in Minuten",
      template: "slider", min: 0, max: 240
    },{
      name: "randrain", label: "Maximale zus&auml;tzliche Dauer einer Regenfront in Minuten",
      template: "slider", min: 0, max: 480
    },{
      name: "dropdarkness", label: "Maximale Dunkelheit durch die Regentropfen",
      template: "slider", min: 1, max: 10
    }]
  }
};
