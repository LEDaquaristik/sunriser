
SunRiser 8 Geräte API
=====================

Die SunRiser Geräte API wird vom Web Interface benutzt damit Konfigurationsänderungen und auch das Auslesen der Konfiguration dort einfach und simpel gemacht werden kann. Durch die Situation das wir hier sehr wenig Speicher haben, wurde beschlossen die API über die [MessagePack](https://msgpack.org/) Serialisierung zu machen, weil dieses ein sehr speicherarmes Verfahren ist. Unsere MessagePack Implementierung hier ist aber etwas alt, sollte aber mit den neusten Implementierungen zusammen funktionieren, falls Sie hier aber Probleme haben, einfach bei unserem Support melden. Als Transport benutzen wir das übliche [HTTP](https://de.wikipedia.org/wiki/Hypertext_Transfer_Protocol), weil dieses schon im Web Interface benutzt wird um z.B. die Webseiten von dem SunRiser zu laden. Der SunRiser ist hier auch nur fähig für HTTP/1.1 und kann keine höhere Version unterstützen.

Konfiguration anpassen
======================

Die allgemeine Funktionlität vom SunRiser wird nur durch seine Konfiguration bestimmt, nur die temporären Funktionen, wie Status abfragen, Funktionstest oder Wartungsarbeiten stehen hier aussen vor und haben Ihre eigenen Konzepte. Alle Parameter der Konfiguration sind [hier in unserem Repository](SunRiser_Config_keys.md) aufgelistet. Die Parameter mit einem **X** benötigen hier noch einen weiteren Parameter jenachdem welches Feld es ist, also z.B. bei den PWM Einstellungen ist es die Nummer des PWM Ausgangs, oder beim Wetter der Name des Wetterprogramms. Dies ist immer sehr dynamisch aber halt auch meist aus der Logik der Situation.

Diese Parameter werden als einfaches Hash im MessagePack an den SunRiser übertragen, oder auch als solche wieder ausgelesen werden können. Hierfür steht ein Endpunkt zur Verfügung der via **POST** oder **PUT** benutzt werden kann um die Parameter auszulesen oder zu schreiben. Wir erklären hier auch kurz die weiteren Optionen um die Konfiguration zu löschen und eine Sicherung herzustellen oder wieder einzuspielen.

POST /
------

Um die aktuellen Parameter die gesetzt sind abzufragen, müssen Sie einen **POST** Request auf **/** machen, welcher im Body ein MessagePack Array mit all den Parametern Schlüsseln, die Sie gern haben möchten. [Hier im Web Interface Javascript](share/web/js/sunriser.js#L4-L10) können Sie sehen welche Parameter z.B. beim Laden der Webseite erstmal geladen werden vom Web Interface. Die Werte kommen dann als MessagePack Hash wieder zurück vom SunRiser.

PUT /
-----

Um Parameter neu zu setzen, müssen Sie einen **PUT** Request auf **/** machen, welcher im Body ein MessagePack Hash hat, mit den Parametern Schlüsseln und neuen Werten, die Sie gern setzen möchten. Unabhängig von Ihrer Abfrage, wird auch immer ein **time** Parameter mitgeschickt, der die UTC Uhrzeit vom SunRiser darstellt, d.h. vor der Zeitzone. Der SunRiser lädt automatisch seine Konfiguration nach, nachdem dieser Request passiert ist.

DELETE /
--------

Mit Vorsicht zu geniessen ist es einen **DELETE** Request auf **/** zu machen, weil dies dazu führt das die gesamte Konfiguration vom SunRiser zurückgestellt wird. Auch hier wird der SunRiser sofort diese Änderung der Konfiguration verarbeiten und darauf reagieren, was z.B. beim Netzwerk u.U. dann Verbindungsprobleme machen könnte.

GET /backup
-----------

Ein **GET** Request auf **/backup** gibt ein MessagePack Hash zurück mit allen Werten vom Gerät. Dies ist auch das exakte gleiche was Sie auf dem Gerät runterladen wenn Sie eine Sicherung erstellen. Diese auszulesen kann Ihnen sicherlich viel helfen.

PUT /restore
------------

Mit einem **PUT** Request auf **/restore** kann eine Sicherung wieder eingespielt werden, vom Prinzip her macht diese aber nichts anderes als die Parameter zu setzen und nicht alte Parameter zu entfernen, daher ist es das gleiche wie ein **PUT** auf **/**, mit dem einzigen Unterschied das der SunRiser hier einen tiefergehenden Neustart macht.

Status abfragen oder setzen
===========================

GET /state
----------

Um den aktuellen Status vom Gerät abzufragen, machen Sie einen **GET** Request auf **/state** was ihnen ein verschachteltes Hash gibt mit vielen Informationen über das Gerät, z.B. auf welchem Wert der PWM gesetzt ist, und ob gerade ein Schnelldruchlauf oder ein Wartungsfenster existiert.

PUT /state
----------

Mit einem **PUT** Request auf **/state** mit der gleichen Struktur wie es beim **GET** Request rauskommt, können hier Werte direkt gesetzt werden, was jenachdem unterschiedliche Effekte hat. Hier z.B. mal die Datenstruktur zum ändern eines Wertes der PWM, was vom SunRiser interpretiert wird als würde ein Funktionstest durchgeführt werden, d.h. alle PWMs werden für eine Minute nicht geändert in Ihren Werten.

```json
{
  "pwms": {
    "1": 250,
    "2": 0
  }
}
```

Bitte beachten: Falls hier ein Programm läuft, würde dies nach einer Minute wieder die Kontrolle übernehmen, wenn Sie dies also nutzen wollen um Ihr Gerät zu steuern dann müssen Sie hier auch kein Programm einstellen. Falls Sie beides haben wollen Programm und eine gewisse Selbstkontrolle, ist der einzige Weg hier das Programm zu übernehmen und die Konfiguration vom Programm zu ersetzen. Quasi die einzelnen Punkte der PWM Steuerung direkt über die API setzen, hier ein Beispiel für einen Request für Konfigurations Anpassung (Siehe oben **PUT** **/**):

```json
{
  "dayplanner#marker#1": [720,50]
}
```

Dies würde bei der Tagesplanung von PWM 1 nur einen Punkt setzen bei 12 Uhr (720ste Minute) mit dem Wert 50%. Sie könnten aber auch direkt einen Übergang anstarten und 2 Punkte setzen:

```json
{
  "dayplanner#marker#1": [720,100,360,0]
}
```

Dies würde einen Punkt setzen auf 12 Uhr mit 100% und einen weiteren Punkt setzen auf 6 Uhr mit 0%. Sobald Sie diese Werte setzen wird auch direkt die LED daran angepasst.

GET /weather
------------

Um den aktuellen Status vom Wetter abzufragen, machen Sie einen **GET** Request auf **/weather**, wir arbeiten hier aber noch an den Details, d.h. hier könnten Änderungen passieren.

Andere Endpunkte
================

Die folgenden per **GET** Requests erreichbaren Endpunkte decken alle anderen besonderen Funktionen ab, die weniger mit der Konfiguration zutun haben.

GET /ok
-------

**GET** auf **/ok** liefert einfach nur den Text **OK** zurück, als eine Art Ping um die generelle Verfügbarkeit zu überprüfen. Dies gibt keinerlei Information über den Funktionsstatus wieder, auch mit einer zerstörten SD Karte könnte der SunRiser ein **OK** hier zurückliefern.

GET /reboot
-----------

Mit einem **GET** auf **/reboot** wird ein Neustart vom Gerät eingeleitet.

GET /firmware.mp
----------------

GET /bootload.mp
----------------

GET /errors
-----------

GET /log
--------

GET /factorybackup
------------------
