FROM debian:buster
RUN apt update && apt -y full-upgrade && apt install -y aptitude
RUN aptitude install -y curl wget gcc make
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash - && curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list && aptitude update

#[Rails]
USER root
WORKDIR /usr/local
RUN wget -O ruby-install-0.8.1.tar.gz https://github.com/postmodern/ruby-install/archive/v0.8.1.tar.gz && tar -xzvf ruby-install-0.8.1.tar.gz && rm -f ruby-install-0.8.1.tar.gz
RUN make install -C ruby-install-0.8.1 && ruby-install --system ruby 3.0.1
RUN gem update --system 
RUN aptitude install -y nodejs yarn libpq-dev
RUN gem install pg rails

#[Postgresql]
RUN aptitude install -y postgresql postgresql-client
USER postgres
WORKDIR /etc/postgresql/11/main/
COPY --chown=postgres:postgres srcs/pg_hba.conf .
COPY --chown=postgres:postgres srcs/postgresql.conf .
RUN service postgresql start && createuser root && createuser admin && createdb transcendence -O admin

#[Redis]
USER root
RUN aptitude install -y redis
#RUN mkdir -p /sys/kernel/mm/transparent_hugepage && echo never > /sys/kernel/mm/transparent_hugepage/enabled
WORKDIR /www
COPY www/Gemfile .
RUN bundle install --jobs 42 --no-prune
COPY srcs/start.sh /