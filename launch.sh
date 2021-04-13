su -c "pg_ctl start -D /var/lib/postgresql/data" - postgres
cd /www
bundle install
/usr/bin/rails s -b '0.0.0.0' -p 80