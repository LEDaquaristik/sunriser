
var sr_forms = {
  network: {
    formtitle: "Netzwerk Einstellungen",
    fields: [{
      name: "hostname", label: "Hostname im Netzwerk"
    },{
      name: "usentp", label: "NTP Server benutzen", type: "checkbox"
    },{
      name: "ntpserver", label: "NTP Server"
    },{
      name: "useip4", label: "Feste IPv4 Adresse benutzen", type: "checkbox"
    },{
      name: "ip4", label: "Feste IPv4 Adresse"
    },{
      name: "ip4_netmask", label: "Feste IPv4 Adresse Netmask"
    },{
      name: "ip4_gateway", label: "Feste IPv4 Adresse Gateway"
    },{
      name: "ip4_dns", label: "Feste IPv4 Adresse DNS"
    },{
      name: "ip4_filter", label: "IPv4 Whitelist Filter aktivieren",
      type: "checkbox"
    },{
      name: "ip4_whitelist", label: "IPv4 Whitelist"
    },{
      name: "webport", label: "Webserver Port"
    }]
  },
  system: {
    formtitle: "System Einstellungen",
    fields: [{
      name: "name", label: "Angezeigter Name des Systems", desc: "Test"
    },{
      name: "indexfile", label: "Startseite nach Anmeldung"
    // },{
    //   name: "timezone", label: "Zeitzone", type: "timezone"
    },{
      name: "nodst", label: "Ignoriere Sommerzeit", type: "checkbox"
    }]
  },
  password: {
    formtitle: "Passwort &auml;ndern",
    no_values: 1,
    fields: [{
      name: "oldpassword", label: "Aktuelles Passwort", type: "password"
    },{
      name: "newpassword", label: "Neues Passwort", type: "password"
    },{
      name: "newpassword2", label: "Neues Passwort wiederholen", type: "password"
    }]
  },
  thunderstorm: {
    formtitle: "Gewitter Simulation",
    prefix: "weather#setup#X#thunder",
    fields: [{
      name: "activated", label: "Simuliere Gewitter", type: "checkbox"
    },{
      name: "daymax", label: "Maximale Anzahl von Gewittern pro Tag"
    },{
      name: "minlength", label: "Minimum L&auml;nge eines Gewitters in Sekunden"
    },{
      name: "maxlength", label: "Maximale L&auml;nge eines Gewitters in Sekunden"
    },{
      name: "balancelength", label: "Anzahl der Faktoren f&uuml;r die Berechnung der Gewitterl&auml;nge"
    },{
      name: "mindist", label: "Minimaler Abstand zwischen den Blitzen"
    },{
      name: "maxdist", label: "Maximaler Abstand zwischen den Blitzen"
    },{
      name: "balancedist", label: "Anzahl der Faktoren f&uuml;r die Berechnung des Abstands zwischen den Blitzen"
    },{
      name: "fadepercent", label: "Prozentualer Anteil f&uuml;r Ein/Ausblendung des Gewitters"
    },{
      name: "daychance", label: "Wahrscheinlichkeit eines Gewitters pro maximale Anzahl von Gewittern am Tag"
    },{
      name: "darkness", label: "Prozentzahl der Dunkelheit die ein Gewitter erzeugt"
    },{
      name: "weekdays", label: "Nur an diesen Wochentagen gibt es Gewitter (sonst jeden Tag)"
    }]
  },
  moon: {
    formtitle: "Mondphasen Simulation",
    prefix: "weather#setup#X#moonphase",
    fields: [{
      name: "activated", label: "Simuliere Mondphasen nach Realit&auml;t", type: "checkbox"
    },{
      name: "starttime", label: "Fr&uuml;hster Mondaufgang"
    },{
      name: "endtime", label: "Sp&auml;tester Monduntergang"
    },{
      name: "maximum", label: "Intensit&auml;t des Monds"
    },{
      name: "deferral", label: "Abstand in Tagen zum echten Mondphasen Zyklus"
    },{
      name: "weekdays", label: "Nur an diesen Wochentagen gibt es Mondphasen (sonst jeden Tag)"
    }]    
  },
  clouds: {
    formtitle: "Wolken Simulation",
    prefix: "weather#setup#X#clouds",
    fields: [{
      name: "activated", label: "Simuliere Wolken", type: "checkbox"
    },{
      name: "cloudminlength", label: "Minimum L&auml;nge einer Wolke in Sekunden"
    },{
      name: "cloudmaxlength", label: "Maximale L&auml;nge einer Wolke in Sekunden"
    },{
      name: "cloudbalancelength", label: "Anzahl der Faktoren f&uuml;r die Berechnung der Wolkenl&auml;nge"
    },{
      name: "cloudchance", label: "Wahrscheinlichkeit einer Wolke pro Minute"
    },{
      name: "clouddarkness", label: "Prozentzahl der Dunkelheit die ein Gewitter erzeugt"
    },{
      name: "weekdays", label: "Nur an diesen Wochentagen gibt es Mondphasen (sonst jeden Tag)"
    }]
  },
  rain: {
    formtitle: "Regen Simulation",
    prefix: "weather#setup#X#rain",
    fields: [{
      name: "activated", label: "Simuliere Regen", type: "checkbox"
    },{
      name: "rainchance", label: "Wahrscheinlichkeit eines Regentages"
    },{
      name: "raindarkness", label: "Maximale Prozentzahl an Dunkelheit die ein Regen haben kann"
    },{
      name: "rainwithclouds", label: "Wolken k&ouml;nnen die Regentage &uuml;ber das maximum dunkler machen", type: "checkbox"
    },{
      name: "weekdays", label: "Nur an diesen Wochentagen gibt es Mondphasen (sonst jeden Tag)"
    }]
  }
};
