[![Build Status](https://travis-ci.org/LEDaquaristik/sunriser.svg?branch=master)](https://travis-ci.org/LEDaquaristik/sunriser)

OpenSource der SunRiser Produkte
================================

An dieser Stelle finden Sie alle bisher veröffentlichen OpenSource Teile der
**SunRiser** Produktreihe von [LEDaquaristik.de](http://www.ledaquaristik.de/).

Bitte beachten Sie das im Open Source Code und den internen Dokumentationen
alles in Englisch verfasst ist, weil die Entwicklung mit Hilfe der
internationalen Open Source Community voran getrieben wird.

Jeglicher Source Code und Konfigurationsdateien veröffentlicht im Rahmen des
SunRiser Projekts sind [GPL](http://www.gnu.org/licenses/gpl-3.0) lizensiert,
soweit nicht anders angegeben. Alle weiteren Dateien (wie z.B. Grafiken)
fallen unter [Creative Commons Attribution 4.0 International](http://creativecommons.org/licenses/by/4.0/).

Installation
============

Um mit der Umgebung zu arbeiten um z.B. uns Korrekturen zu schicken für das HTML
welche Sie vorher direkt selber testen können, wird ein bisschen Erfahrung mit
[git](http://de.wikipedia.org/wiki/Git) und der englischen Sprache vorausgesetzt.
Ein Linux Betriebssystem und Erfahrung mit diesem sind auch notwendig.

Sie können den Simulator und die Umgebung mit folgenden Anweisungen einrichten
(neben git und curl wird auch ein C compiler benötigt):

```bash
curl -L https://cpanmin.us | perl - --local-lib=~/perl5 local::lib App::cpanminus
git clone https://github.com/LEDaquaristik/sunriser.git
cd sunriser
~/perl5/bin/cpanm --local-lib=~/perl5 --installdeps .
perl -I$HOME/perl5/lib/perl5 -Mlocal::lib bin/sunriser_simulator
```

Microcontroller Software
========================

In diesem [Download Verzeichnis](https://sunriser.vbs.io/objs/) finden Sie alle
Archive der Objektdateien, von den bisher veröffentlichen Versionen von der
SunRiser Microcontroller Software. In jedem Archiv befinden sich Informationen
um die Microcontroller Software neu zu compilieren, um die
[LGPL](http://de.wikipedia.org/wiki/GNU_Lesser_General_Public_License)
lizenzierten Teile (wie [libopencm3](http://libopencm3.org/)) auszutauschen.
