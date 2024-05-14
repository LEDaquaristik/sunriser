FROM buildpack-deps:bookworm

ARG SUNRISER_UID="1000"
ARG SUNRISER_GID="1000"

ENV SUNRISER_UID ${SUNRISER_UID}
ENV SUNRISER_GID ${SUNRISER_GID}

# Install Debian packages ----------------------------------------------------

ENV DEBIAN_FRONTEND  "noninteractive"

RUN echo "locales locales/locales_to_be_generated multiselect en_US.UTF-8 UTF-8" > /debconf-preseed.txt \
  && echo "locales locales/default_environment_locale select en_US.UTF-8" >> /debconf-preseed.txt \
  && debconf-set-selections /debconf-preseed.txt && apt-get update -y \
  && apt-get install -y git zip unzip bzip2 ca-certificates hostname wget \
    build-essential libssl-dev zlib1g-dev locales apt-utils curl libcdb-dev \
    libev-dev cmake python3 python-is-python3 libc6-i386 openocd \
  && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/log/* /var/cache/*

WORKDIR /usr/src

# Install ARM Toolchain ----------------------------------------------------

RUN wget -O gcc-arm-none-eabi-4_9-2014q4-20141203-linux.tar.bz2 \
  https://launchpad.net/gcc-arm-embedded/4.9/4.9-2014-q4-major/+download/gcc-arm-none-eabi-4_9-2014q4-20141203-linux.tar.bz2 \
  && tar xvjf gcc-arm-none-eabi-4_9-2014q4-20141203-linux.tar.bz2 \
  && rm gcc-arm-none-eabi-4_9-2014q4-20141203-linux.tar.bz2

ENV PATH          "/usr/src/gcc-arm-none-eabi-4_9-2014q4/bin:${PATH}"

# Install Perl -------------------------------------------------------------

ENV PERL_VERSION  "5.38.2"
ENV PERL_SHA256   "a0a31534451eb7b83c7d6594a497543a54d488bc90ca00f5e34762577f40655e"

RUN mkdir -p /usr/src/perl && cd /usr/src/perl \
  && curl -sfSLO https://www.cpan.org/src/5.0/perl-${PERL_VERSION}.tar.gz \
  && echo -n "${PERL_SHA256}  perl-${PERL_VERSION}.tar.gz" | sha256sum -cw - \
  && echo "-j$(nproc)" >~/.proverc \
  && tar --strip-components=1 -xzf perl-${PERL_VERSION}.tar.gz -C /usr/src/perl \
  && rm perl-${PERL_VERSION}.tar.gz \
  && ./Configure -des \
  && make -j$(nproc) install \
  && rm -rf /usr/src/perl

RUN ( yes '' | cpan -T Clone ) \
  && cpan -T App::cpanminus App::cpm Carton LWP::Protocol::https \
  && rm -rf ~/.cpan

COPY ./docker-entrypoint.sh /docker-entrypoint.sh

# Install SunRiser User ------------------------------------------------------------

ENV SUNRISER_PROJECT_ROOT  "/opt/sunriser"

RUN mkdir /home/sunriser \
  && groupadd -g ${SUNRISER_GID} sunriser \
  && useradd -s /bin/bash -d /home/sunriser -u ${SUNRISER_UID} -g ${SUNRISER_GID} sunriser \
  && chown ${SUNRISER_UID}.${SUNRISER_GID} /home/sunriser \
  && rm -rf /tmp/*

RUN install -o ${SUNRISER_UID} -g ${SUNRISER_GID} -d ${SUNRISER_PROJECT_ROOT}/install

USER ${SUNRISER_UID}:${SUNRISER_GID}

WORKDIR ${SUNRISER_PROJECT_ROOT}/src

# Install Perl Modules --------------------------------------------------------

ENV PATH                 "${SUNRISER_PROJECT_ROOT}/install/perl5/bin:${PATH}"
ENV PERL5LIB             "${SUNRISER_PROJECT_ROOT}/install/perl5/lib/perl5"
ENV PERL_LOCAL_LIB_ROOT  "${SUNRISER_PROJECT_ROOT}/install/perl5"
ENV PERL_MB_OPT          "--install_base ${SUNRISER_PROJECT_ROOT}/install/perl5"
ENV PERL_MM_OPT          "INSTALL_BASE=${SUNRISER_PROJECT_ROOT}/install/perl5"
ENV PERL_CARTON_PATH     "${SUNRISER_PROJECT_ROOT}/install/perl5"

COPY --chown=${SUNRISER_UID}:${SUNRISER_GID} ./docker ${SUNRISER_PROJECT_ROOT}/src/docker

RUN ( cd docker/CDB-TinyCDB-0.05-patched && cpanm -f --verbose . )

COPY --chown=${SUNRISER_UID}:${SUNRISER_GID} ./cpanfile ${SUNRISER_PROJECT_ROOT}/src
COPY --chown=${SUNRISER_UID}:${SUNRISER_GID} ./cpanfile.snapshot ${SUNRISER_PROJECT_ROOT}/src

RUN cpm install --cpanfile=./cpanfile --snapshot=./cpanfile.snapshot \
  --workers=$(nproc) --local-lib-contained=${PERL_LOCAL_LIB_ROOT} \
  && rm -rf ~/.perl-cpm/ /tmp/*

COPY --chown=${SUNRISER_UID}:${SUNRISER_GID} . ${SUNRISER_PROJECT_ROOT}/src

# Add project path ------------------------------------------------------------

ENV PATH           "${SUNRISER_PROJECT_ROOT}/src/bin:${PATH}"

ENTRYPOINT ["/docker-entrypoint.sh"]
