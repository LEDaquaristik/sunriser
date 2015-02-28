
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
      name: "usentp", label: "NTP Server benutzen"
    }],
    expert_fields: [{
      name: "ntpserver", label: "NTP Server"
    },{
      name: "useip4", label: "Feste IPv4 Adresse benutzen"
    },{
      name: "ip4", label: "Feste IPv4 Adresse"
    },{
      name: "ip4_netmask", label: "Feste IPv4 Adresse Netmask"
    },{
      name: "ip4_gateway", label: "Feste IPv4 Adresse Gateway"
    },{
      name: "ip4_dns", label: "Feste IPv4 Adresse DNS"
    },{
    //   name: "ip4_filter", label: "IPv4 Whitelist Filter aktivieren"
    // },{
    //   name: "ip4_whitelist", label: "IPv4 Whitelist"
    // },{
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
      name: "timezone", label: "Zeitzone", type: "timezone"
    },{
      name: "showexpert", label: "Experten Funktionen aktivieren"
    },{
      name: "nohelp", label: "Keine Hilfe anzeigen"
    },{
      name: "nodst", pre: true
    },{
      name: "gmtoff", pre: true
    }],
    expert_fields: [{
      name: "nofinder", label: "SunRiser Finder deaktivieren"
    // },{
    //   name: "indexfile", label: "Startseite nach Anmeldung"
    }]
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
      name: "activated", label: "Simuliere Gewitter"
    },{
      name: "daymax", label: "Maximale Anzahl von Gewittern pro Tag",
      template: "slider", min: 1, max: 24
    },{
      name: "minlength", label: "Minimum L&auml;nge eines Gewitters in Sekunden",
      template: "slider", min: 120, max: 600
    },{
      name: "maxlength", label: "Maximale L&auml;nge eines Gewitters in Sekunden",
      template: "slider", min: 240, max: 1200
    },{
      name: "mindist", label: "Minimaler Abstand zwischen den Blitzen in Sekunden",
      template: "slider", min: 1, max: 60
    },{
      name: "maxdist", label: "Maximaler Abstand zwischen den Blitzen",
      template: "slider", min: 10, max: 300
    // },{
    //   name: "fadepercent", label: "Prozentualer Anteil f&uuml;r Ein/Ausblendung des Gewitters"
    },{
      name: "daychance", label: "Wahrscheinlichkeit eines Gewitters pro maximale Anzahl von Gewittern am Tag",
      template: "slider", min: 1, max: 100
    },{
      name: "weekdays", label: "Nur an diesen Wochentagen gibt es Gewitter (sonst jeden Tag)"
    }],
    expert_fields: [{
      name: "balancelength", label: "Anzahl der Faktoren f&uuml;r die Berechnung der Gewitterl&auml;nge",
      template: "slider", min: 1, max: 5
    },{
      name: "balancedist", label: "Anzahl der Faktoren f&uuml;r die Berechnung des Abstands zwischen den Blitzen",
      template: "slider", min: 1, max: 5
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
    prefix: "weather#setup#X#moonphase",
    fields: [{
      name: "activated", label: "Simuliere Mondphasen nach Realit&auml;t"
    // },{
    //   name: "starttime", label: "Fr&uuml;hster Mondaufgang"
    // },{
    //   name: "endtime", label: "Sp&auml;tester Monduntergang"
    },{
      name: "maximum", label: "Maximale Intensit&auml;t des Mondes",
      template: "slider", min: 0, max: 100
    },{
      name: "deferral", label: "Abstand in Tagen zum echten Mondphasen Zyklus",
      template: "slider", min: -31, max: 31
    },{
      name: "weekdays", label: "Nur an diesen Wochentagen gibt es Mondphasen (sonst jeden Tag)"
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
      name: "activated", label: "Simuliere Wolken"
    },{
      name: "cloudchance", label: "Wahrscheinlichkeit einer Wolke pro Minute",
      template: "slider", min: 0, max: 100
    },{
      name: "weekdays", label: "Nur an diesen Wochentagen gibt es Wolken (sonst jeden Tag)"
    }],
    expert_fields: [{
      name: "cloudminlength", label: "Minimum L&auml;nge einer Wolke in Sekunden",
      template: "slider", min: 1, max: 30
    },{
      name: "cloudmaxlength", label: "Maximale L&auml;nge einer Wolke in Sekunden",
      template: "slider", min: 5, max: 60
    },{
      name: "cloudbalancelength", label: "Anzahl der Faktoren f&uuml;r die Berechnung der Wolkenl&auml;nge",
      template: "slider", min: 1, max: 5
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
      name: "activated", label: "Simuliere Regen"
    },{
      name: "rainchance", label: "Wahrscheinlichkeit eines Regentages",
      template: "slider", min: 0, max: 100
    },{
      name: "weekdays", label: "Nur an diesen Wochentagen gibt es Regen (sonst jeden Tag)"
    }]
  }
};
