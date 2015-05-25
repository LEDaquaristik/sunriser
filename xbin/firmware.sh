#!/usr/bin/env bash

set -e

VERSION=$1

WORKDIR=$( pwd )
VERSION_FILENAME=$( echo $VERSION | tr '.' '_' )
LOGFILE=$WORKDIR/build.$1.log
CURRENT_DATE_FILENAME=$( date +%Y%m%d_%H%M%S )
NOW=$( date +%s )

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
V=$VERSION SR_TIMESTAMP=$NOW make PRODUCTION_FIRMWARE=1 -s clean main.bin bootloader.bin dist &>$LOGFILE

cp -v $OBJS_FILE $WORKDIR/
cp -v main.bin $WORKDIR/
cp -v bootloader.bin $WORKDIR/

cd $WORKDIR

echo "Generating factory file..."
V=$VERSION SR_TIMESTAMP=$NOW bin/sunriser_factory $FIRMWARE_FILE >>$LOGFILE

