[![Build Status](https://travis-ci.org/LEDaquaristik/sunriser.svg?branch=master)](https://travis-ci.org/LEDaquaristik/sunriser)

OpenSource der SunRiser Produkte
================================

An dieser Stelle finden Sie alle bisher veröffentlichen OpenSource Teile der
**SunRiser** Produktreihe von [LEDaquaristik.de](http://www.ledaquaristik.de/).

Bitte beachten Sie das im Open Source Code und den internen Dokumentationen
alles in Englisch verfasst ist, weil das Team schon jetzt aus Leuten von vielen
Ländern besteht (wie z.B. Belgien oder Schweiz).

Installation
============

Um mit der Umgebung zu arbeiten um z.B. uns Korrekturen zu schicken für das HTML
welche Sie vorher direkt selber testen können, wird ein bisschen Erfahrung mit
git und der englischen Sprache vorausgesetzt. Ein Linux Betriebssystem und
Erfahrung mit diesem sind auch notwendig.

Sie können den Simulator und die Umgebung mit folgenden Anweisungen einrichten
(neben git und curl wird auch ein C compiler benötigt):

```bash
curl -L https://cpanmin.us | perl - --local-lib=~/perl5 local::lib App::cpanminus
git clone https://github.com/LEDaquaristik/sunriser.git
cd sunriser
~/perl5/bin/cpanm --local-lib=~/perl5 --installdeps .
perl -I$HOME/perl5/lib/perl5 -Mlocal::lib bin/sunriser_simulator
```
