FROM alpine

ENV FT_ID f4b37cbaf338086eb088d7718e257cc856bb60c3758ca802a941ce8ed8c35ba9
ENV FT_SECRET eca37713c88c7150d8032c0ce111a5ac5e5d1d640e4bb4fccdf379109924f5c5

RUN apk -U upgrade && apk add build-base ruby-full ruby-dev zlib-dev postgresql-dev nodejs yarn tzdata postgresql

# Ruby on Rails
RUN gem install pg rails
COPY www/ /www/
WORKDIR /www
RUN bundle install
RUN bundle exec rake webpacker:install

# Postgresql
RUN su -c "initdb /var/lib/postgresql/data" - postgres
COPY srcs/pg_hba.conf /var/lib/postgresql/data/
COPY srcs/postgresql.conf /var/lib/postgresql/data/
RUN chmod -R 700 /var/lib/postgresql/data/ \
	&& chown -R postgres:postgres /var/lib/postgresql/data/ \
	&& mkdir -p /var/run/postgresql \
	&& chown -R postgres:postgres /var/run/postgresql/
RUN su -c "pg_ctl start -D /var/lib/postgresql/data" - postgres \
	&& echo "create user trans with encrypted password 'trans';" | su -c "psql" - postgres \
	&& echo "create database trans;" | su -c "psql" - postgres \
	&& echo "grant all privileges on database trans to trans;" | su -c "psql" - postgres

# phppgadmin
RUN apk add lighttpd php7-common php7-session php7-iconv php7-json php7-gd php7-curl \
php7-xml php7-mysqli php7-imap php7-cgi fcgi php7-pdo php7-pdo_mysql php7-soap \
php7-xmlrpc php7-posix php7-mcrypt php7-gettext php7-ldap php7-ctype php7-dom \
postgresql postgresql-client php-pgsql php-mbstring
COPY srcs/lighttpd.conf /etc/lighttpd/lighttpd.conf
COPY srcs/adminer-4.8.0.php /var/www/localhost/htdocs/
RUN mv /var/www/localhost/htdocs/adminer-4.8.0.php /var/www/localhost/htdocs/index.php \
	&& mkdir /var/run/lighttpd \
    && touch /var/run/lighttpd/php-fastcgi.socket \
    && chown -R lighttpd:lighttpd /var/run/lighttpd

COPY srcs/launch.sh /
