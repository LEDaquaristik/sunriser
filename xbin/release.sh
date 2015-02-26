#!/usr/bin/env bash

set -e

VERSION=$1
RELEASE_FILE=$2

WORKDIR=$( pwd )
VERSION_FILENAME=$( echo $VERSION | tr '.' '_' )
LOGFILE=$WORKDIR/build.$1.log

TARGET=sunriser@sunriser

OBJS_FILE=SunRiser8_Firmware_v${VERSION_FILENAME}_objs.tar.gz
FIRMWARE_FILE=SunRiser8_Firmware_v$VERSION_FILENAME.bee

if [ ! -f $SUNRISER_MCU/xbin/generate_version_h.pl ]; then
  echo "Full source of microcontroller required for making release"
  exit 1
fi

echo "Releasing v$VERSION..."

rm -f $LOGFILE

cd $SUNRISER_MCU

echo "Generating microcontroller application and object file distribution..."
V=$VERSION make -s clean main.bin dist &>$LOGFILE

cp -v $OBJS_FILE $WORKDIR/
cp -v main.bin $WORKDIR/

cd $WORKDIR

echo "Generating factory file..."
V=$VERSION bin/sunriser_factory $FIRMWARE_FILE >>$LOGFILE

echo "Upload to target..."
scp $OBJS_FILE     $TARGET:~/htdocs/objs/
scp $FIRMWARE_FILE $TARGET:~/htdocs/
scp $RELEASE_FILE  $TARGET:~/
echo "Install distribution, upgrade images file..."
ssh $TARGET        "cpanm $RELEASE_FILE; cd htdocs; sunriser_generatemaster"

echo "Release of v$VERSION done..."

exit 0
