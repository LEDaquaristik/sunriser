#!/usr/bin/env bash

set -e

VERSION=$1
RELEASE_FILE=$2

WORKDIR=$( pwd )
VERSION_FILENAME=$( echo $VERSION | tr '.' '_' )
LOGFILE=$WORKDIR/build.$1.log
CURRENT_DATE_FILENAME=$( date +%Y%m%d_%H%M%S )
NOW=$( date +%s )

TARGET=sunriser@sunriser

OBJS_FILE=SunRiser8_Firmware_v${VERSION_FILENAME}_objs.tar.gz
FIRMWARE_FILE=SunRiser8_Firmware_v$VERSION_FILENAME.bee

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

$DIR/firmware.sh $VERSION

echo "Tagging code with v$VERSION..."

cd $SUNRISER_MCU
git tag -a v$VERSION -m "SunRiser Release v$VERSION $CURRENT_DATE_FILENAME"
cd $WORKDIR

echo "Releasing v$VERSION..."

echo "Upload to target..."
scp $OBJS_FILE     $TARGET:~/htdocs/objs/
scp $FIRMWARE_FILE $TARGET:~/htdocs/
scp $RELEASE_FILE  $TARGET:~/

ssh $TARGET "(
  echo Killing old demo server... && \
  /sbin/start-stop-daemon -o -p sr_demo_web.pid --stop && \
  echo Killing old finder server... && \
  /sbin/start-stop-daemon -o -p sr_finder.pid --stop && \
  echo Deleting demo cache... && \
  rm -rf .srdemocache && \
  echo Waiting... && sleep 5 && \
  echo Install distribution, upgrade images file... && \
  cpanm $RELEASE_FILE && cd htdocs && sunriser_generatemaster && cd .. && \
  echo Extracting sunriser.psgi && \
  tar xvzf $RELEASE_FILE --wildcards --strip-components=1 \\*/sunriser.psgi && \
  echo Starting new demo server... && \
  starman --listen :7781 --workers 8 --pid sr_demo_web.pid --daemonize sunriser.psgi && \
  echo Starting new finder server... && \
  /sbin/start-stop-daemon -o -m -p sr_finder.pid --start --background --exec \$( type -p sunriser_finder ) && \
  echo Reload of servers done...
)"

echo "Release of v$VERSION done..."

exit 0
