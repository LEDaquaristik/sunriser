#!/usr/bin/env bash

if [ -f ${SUNRISER_PROJECT_ROOT}/src/banner ]; then
  cat ${SUNRISER_PROJECT_ROOT}/src/banner
fi

exec $@
